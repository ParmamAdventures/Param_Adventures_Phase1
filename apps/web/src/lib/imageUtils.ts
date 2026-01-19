/**
 * Image Utility Functions
 * Consolidated from canvasUtils.ts and cropImage.ts to eliminate duplication
 */

/**
 * Creates an HTML Image element from a URL
 * @param url - The image URL to load
 * @returns Promise that resolves with the loaded image
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Converts degrees to radians
 * @param degreeValue - Angle in degrees
 * @returns Angle in radians
 */
export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Calculates the new bounding box dimensions after rotation
 * @param width - Original width
 * @param height - Original height
 * @param rotation - Rotation angle in degrees
 * @returns New dimensions { width, height }
 */
export function rotateSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}
