// server/services/userService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Call this function after you verify the JWT in your middleware
export async function getOrCreateUser(email: string, externalId: string, name?: string) {
  try {
    const user = await prisma.user.upsert({
      where: { 
        email: email 
      },
      // If user exists, just update their external ID if it changed
      update: {
        externalId: externalId
      },
      // If user is new, create them!
      create: {
        email: email,
        externalId: externalId,
        name: name || "Anonymous Student", // Default name
      },
    });

    return user;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error("Database Sync Failed");
  }
}