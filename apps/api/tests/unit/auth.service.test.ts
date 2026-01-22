import { authService } from "../../src/services/auth.service";
import { prisma } from "../../src/lib/prisma";
import { hashPassword, verifyPassword } from "../../src/utils/password";
import { signAccessToken, signRefreshToken } from "../../src/utils/jwt";
import { auditService } from "../../src/services/audit.service";

jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  signResetToken: jest.fn(),
  verifyResetToken: jest.fn(),
}));

jest.mock("../../src/services/audit.service", () => ({
  auditService: {
    logAudit: jest.fn(),
  },
}));

jest.mock("../../src/services/notification.service", () => ({
  notificationService: {
    sendPasswordResetEmail: jest.fn(),
  },
}));

describe("AuthService", () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register successfully", async () => {
      const data = { email: "a@b.com", password: "p", name: "n" };
      prismaMock.user.findUnique.mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue("hashed");
      prismaMock.user.create.mockResolvedValue({ id: "1", ...data });

      const res = await authService.register(data);
      expect(res.id).toBe("1");
      expect(prismaMock.user.create).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const user = { id: "1", email: "a@b.com", password: "hp" };
      prismaMock.user.findUnique.mockResolvedValue(user);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (signAccessToken as jest.Mock).mockReturnValue("at");
      (signRefreshToken as jest.Mock).mockReturnValue("rt");
      (auditService.logAudit as jest.Mock).mockResolvedValue({});

      const res = await authService.login("a@b.com", "p");
      expect(res.accessToken).toBe("at");
      expect(res.user.id).toBe("1");
    });

    it("should fail with invalid creds", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(authService.login("a", "p")).rejects.toThrow("Invalid credentials");
    });
  });

  describe("socialLogin", () => {
    const googleProfile = {
      id: "google123",
      email: "google@example.com",
      name: "Google User",
    };

    it("should login user if googleId exists", async () => {
      const user = { id: "user1", email: googleProfile.email, name: googleProfile.name, googleId: googleProfile.id, password: null };
      prismaMock.user.findUnique.mockResolvedValue(user); // Mock finding by googleId

      (signAccessToken as jest.Mock).mockReturnValue("at_social");
      (signRefreshToken as jest.Mock).mockReturnValue("rt_social");
      (auditService.logAudit as jest.Mock).mockResolvedValue({});

      const res = await authService.socialLogin(googleProfile);
      expect(res.accessToken).toBe("at_social");
      expect(res.user.id).toBe("user1");
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { googleId: googleProfile.id } });
      expect(prismaMock.user.update).not.toHaveBeenCalled(); // No update needed if googleId found
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("should link googleId to existing user with matching email and login", async () => {
      const existingUser = { id: "2", email: googleProfile.email, name: "Existing User", password: "hp" };
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // Not found by googleId
        .mockResolvedValueOnce(existingUser); // Found by email

      const updatedUser = { ...existingUser, googleId: googleProfile.id, password: existingUser.password }; // Keep existing password if present
      prismaMock.user.update.mockResolvedValue(updatedUser);

      (signAccessToken as jest.Mock).mockReturnValue("at_social_linked");
      (signRefreshToken as jest.Mock).mockReturnValue("rt_social_linked");
      (auditService.logAudit as jest.Mock).mockResolvedValue({});

      const res = await authService.socialLogin(googleProfile);
      expect(res.accessToken).toBe("at_social_linked");
      expect(res.user.id).toBe("2");
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { googleId: googleProfile.id } });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: googleProfile.email } });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: { googleId: googleProfile.id },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("should create new user if neither googleId nor email exists and login", async () => {
      const newUser = { id: "user3", email: googleProfile.email, name: googleProfile.name, googleId: googleProfile.id, password: null };
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // Not found by googleId
        .mockResolvedValueOnce(null); // Not found by email

      prismaMock.user.create.mockResolvedValue(newUser);

      (signAccessToken as jest.Mock).mockReturnValue("at_social_new");
      (signRefreshToken as jest.Mock).mockReturnValue("rt_social_new");
      (auditService.logAudit as jest.Mock).mockResolvedValue({});

      const res = await authService.socialLogin(googleProfile);
      expect(res.accessToken).toBe("at_social_new");
      expect(res.user.id).toBe("user3");
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { googleId: googleProfile.id } });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: googleProfile.email } });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: googleProfile.email,
          name: googleProfile.name,
          googleId: googleProfile.id,
        },
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });
});
