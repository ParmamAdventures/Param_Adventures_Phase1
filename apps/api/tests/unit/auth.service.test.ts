
import { authService } from "../../src/services/auth.service";
import { prisma } from "../../src/lib/prisma";
import { hashPassword, verifyPassword } from "../../src/utils/password";
import { signAccessToken, signRefreshToken } from "../../src/utils/jwt";
import { auditService } from "../../src/services/audit.service";
import { notificationService } from "../../src/services/notification.service";

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
});
