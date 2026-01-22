const mockCloudinaryV2 = {
    config: jest.fn(),
    api: {
        delete_resources: jest.fn().mockResolvedValue({}),
    },
};

export const cloudinary = mockCloudinaryV2; // Direct export of the v2 object

export const storage = {
  options: {},
};

jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn().mockImplementation(() => ({
    // Mock any methods or properties of CloudinaryStorage if needed
  })),
}));
