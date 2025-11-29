// server/middleware/mockAuth.ts
import { Request, Response, NextFunction } from 'express';
import { getOrCreateUser } from '../services/userService';

// This fakes a logged-in user so we can test uploading immediately
export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // HARDCODED "TEST USER" for Level 4 Development
    // TODO: Replace this with real JWT decoding logic later
    const user = await getOrCreateUser(
      "test_student@chitkara.edu.in", 
      "auth0|123456", 
      "Test Student"
    );

    // Attach user to the request object so API routes can use it
    (req as any).user = user; 
    
    next();
  } catch (error) {
    res.status(500).json({ error: "Auth Failed" });
  }
};