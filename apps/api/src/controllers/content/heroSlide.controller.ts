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
  subtitle: z.string().optional().nullable(),
  videoUrl: z.string().min(1),
  ctaLink: z.string().optional().nullable(),
});

// Update a hero slide (Admin)
export async function updateHeroSlide(req: Request, res: Response) {
  const { id } = req.params;
  console.log(`[UpdateSlide] ID: ${id}, Body:`, req.body); // Debug log

  const result = updateHeroSlideSchema.safeParse(req.body);

  if (!result.success) {
    console.error("[UpdateSlide] Validation Error:", JSON.stringify(result.error.format(), null, 2));
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
