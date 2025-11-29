import express from 'express';
import multer from 'multer';
import { requireUser } from '../middleware/mockAuth';
import { parseTimetableImage } from '../services/aiService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', requireUser, upload.single('timetableImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const user = (req as any).user;

    // 1. Call Gemini (This works!)
    const extractedData = await parseTimetableImage(req.file.buffer, req.file.mimetype);
    // console.log("✅ AI Extraction Successful");

    // 2. Try to Save to Database (But don't crash if it fails)
    let versionId = "unsaved_preview";
    
    try {
      const metadata = await prisma.timetableMetadata.upsert({
        where: {
          department_semester_section_academicYear: {
            department: "CSE",
            semester: 5,
            section: "G3",
            academicYear: "2025"
          }
        },
        update: {},
        create: {
          department: "CSE",
          semester: 5,
          section: "G3",
          academicYear: "2025"
        }
      });

      const newVersion = await prisma.timetableVersion.create({
        data: {
          data: extractedData ?? {}, 
          uploaderId: user.id,
          metadataId: metadata.id,
          netScore: 0
        }
      });
      versionId = newVersion.id;
      console.log("✅ Saved to Database");

    } catch (dbError) {
      console.error("⚠️ Database Save Failed (Sending AI data anyway):", dbError);
      // We continue! We don't want to block the UI just because DB failed.
    }

    // 3. Respond to Frontend
    res.json({ 
      success: true, 
      versionId: versionId,
      data: extractedData 
    });

  } catch (error) {
    console.error("Critical Upload error:", error);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;