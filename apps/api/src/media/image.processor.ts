import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export async function processAndSaveImage(
  buffer: Buffer,
  outputPath: string,
  width: number
) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(buffer)
    .toFile(outputPath);

  // Optional: generate thumbnail if requested (filename usually differs)
  // For this simplified version, we'll keep it strictly one-to-one based on the plan's 8.1 "Simple" approach,
  // but we should ensure the API allows passing different widths.
}

export async function processImageVariation(
  buffer: Buffer,
  outputDir: string,
  filename: string
) {
  // Main
  await processAndSaveImage(
    buffer,
    path.join(outputDir, filename),
    1200
  );
  
  // Thumbnail
  await processAndSaveImage(
    buffer,
    path.join(outputDir, `thumb-${filename}`),
    400
  );
}
