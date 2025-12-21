import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { auditService } from "../services/audit.service";

const prisma = new PrismaClient();

export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { name, bio, avatarImageId } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        avatarImageId,
      },
      include: {
        avatarImage: true,
      }
    });

    await auditService.logAudit({
      actorId: userId,
      action: "USER_UPDATE_PROFILE",
      targetType: "User",
      targetId: userId,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatarImage: user.avatarImage,
      },
    });
  } catch (error) {
    console.error("Failed to update profile", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
