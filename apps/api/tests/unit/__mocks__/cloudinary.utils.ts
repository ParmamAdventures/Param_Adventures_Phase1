export const resolvePublicId = jest.fn((file: any) => {
  // Simple mock implementation: extract public ID from a Cloudinary URL pattern
  // e.g., "https://cloudinary.com/upload/v12345/my_image.jpg" -> "my_image"
  const match = file.path.match(/\/v\d+\/([^/.]+)\./);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback for direct Cloudinary URLs in tests
  const directMatch = file.path.match(/cloudinary.com\/upload\/(?:v\d+\/)?([^/.]+)/);
  if (directMatch && directMatch[1]) {
    return directMatch[1].split(',')[0]; // Handles formats like c_limit,w_1200/image123
  }
  return `mock_public_id_${Math.random().toString(36).substring(7)}`;
});

export const buildImageUrls = jest.fn(
  (publicId: string, version: string, originalPath: string) => {
    // Mimic the format seen in the test output
    const baseUrl = `https://res.cloudinary.com/mock-cloud/image/upload`;
    return {
      originalUrl: originalPath, // Use original path as is for simplicity in mock
      mediumUrl: `${baseUrl}/c_limit,w_1200/${publicId}`,
      thumbUrl: `${baseUrl}/c_fill,g_auto,h_500,w_800/${publicId}`,
    };
  },
);

export const buildVideoUrls = jest.fn(
  (publicId: string, version: string, originalPath: string) => {
    // Mimic the format seen in the test output for videos
    const baseUrl = `https://res.cloudinary.com/mock-cloud/video/upload`;
    return {
      originalUrl: originalPath,
      mediumUrl: `${baseUrl}/c_limit,w_1200/${publicId}`,
      thumbUrl: `${baseUrl}/c_fill,g_auto,h_500,w_800/${publicId}`,
    };
  },
);

export const inferResourceType = jest.fn((mimetype: string) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
});

export const extractPublicIdFromUrl = jest.fn((url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^/.]+)/);
    if (match && match[1]) {
      return match[1].split(',')[0]; // Handles formats like c_limit,w_1200/image123
    }
    return null;
  });
