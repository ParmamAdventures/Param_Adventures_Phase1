import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Get all hero slides (Public)
export async function getHeroSlides(req: Request, res: Response) {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });
  return res.json(slides);
}

const updateHeroSlideSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  videoUrl: z.string().url(),
  ctaLink: z.string().optional(),
});

// Update a hero slide (Admin)
export async function updateHeroSlide(req: Request, res: Response) {
  const { id } = req.params;
  const result = updateHeroSlideSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { title, subtitle, videoUrl, ctaLink } = result.data;

  try {
    const updatedSlide = await prisma.heroSlide.update({
      where: { id },
      data: {
        title,
        subtitle,
        videoUrl,
        ctaLink,
      },
    });
    return res.json(updatedSlide);
  } catch (error) {
    return res.status(404).json({ error: "Slide not found" });
  }
}
