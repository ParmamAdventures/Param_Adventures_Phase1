import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { auditService } from "../services/audit.service";

export async function updateProfile(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { name, nickname, bio, avatarImageId, age, gender, phoneNumber, address } = req.body;

  try {
    const user = await (prisma.user as any).update({
      where: { id: userId },
      data: {
        name,
        nickname,
        bio,
        age: age ? Number(age) : null,
        gender,
        phoneNumber,
        address,
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
        nickname: user.nickname,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        address: user.address,
        avatarImage: user.avatarImage,
      },
    });
  } catch (error) {
    console.error("Failed to update profile", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
