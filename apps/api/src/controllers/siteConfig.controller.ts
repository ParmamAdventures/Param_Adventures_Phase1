import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSiteConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await prisma.siteConfig.findMany();
    // Convert array to object for easier frontend consumption { key: value }
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json(configMap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching site configs' });
  }
};

export const updateSiteConfig = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ message: 'Key and value are required' });
    }

    const updated = await prisma.siteConfig.update({
      where: { key },
      data: { value },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating site config' });
  }
};
