// Set env vars BEFORE any requires so ADMIN_EMAILS is captured at module load
process.env.JWT_SECRET = "test-secret";
process.env.ADMIN_EMAILS = "admin@example.com";

// Mock dependencies with paths relative from tests/ to src/
jest.mock("../src/config/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signup, login } = require("../src/services/authService");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────── SIGNUP ─────────────────────────

  describe("signup", () => {
    const input = {
      name: "Test User",
      email: "test@example.com",
      password: "plaintext123",
    };

    it("should create a new user and return token + user object", async () => {
      const createdUser = {
        id: 1,
        name: input.name,
        email: input.email,
        role: "user",
        password: "hashed-pw",
      };

      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-pw");
      prisma.user.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue("fake-token");

      const result = await signup(input);

      // bcrypt.hash called with the raw password and salt rounds 10
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);

      // prisma.user.create called with hashed password
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          email: input.email,
          password: "hashed-pw",
          role: "user",
        },
      });

      // returns expected shape
      expect(result).toEqual({
        token: "fake-token",
        user: {
          id: 1,
          name: input.name,
          email: input.email,
          role: "user",
        },
      });
    });

    it("should throw a 400 error when the user already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: input.email });

      try {
        await signup(input);
        // fail the test if no error is thrown
        throw new Error("Expected signup to throw");
      } catch (err) {
        expect(err.message).toBe("User already exists");
        expect(err.statusCode).toBe(400);
      }

      // Should never attempt to create the user
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────── LOGIN ──────────────────────────

  describe("login", () => {
    const input = { email: "test@example.com", password: "plaintext123" };
    const storedUser = {
      id: 1,
      name: "Test User",
      email: input.email,
      password: "hashed-pw",
      role: "user",
    };

    it("should return token and user for valid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("login-token");

      const result = await login(input);

      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, storedUser.password);
      expect(result).toEqual({
        token: "login-token",
        user: {
          id: storedUser.id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role,
        },
      });
    });

    it("should throw a 400 error when the user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      try {
        await login(input);
        throw new Error("Expected login to throw");
      } catch (err) {
        expect(err.message).toBe("Invalid credentials");
        expect(err.statusCode).toBe(400);
      }

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw a 400 error when the password is wrong", async () => {
      prisma.user.findUnique.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(false);

      try {
        await login(input);
        throw new Error("Expected login to throw");
      } catch (err) {
        expect(err.message).toBe("Invalid credentials");
        expect(err.statusCode).toBe(400);
      }
    });
  });

  // ──────────────────── JWT TOKEN GENERATION ────────────────

  describe("JWT token generation", () => {
    it("should call jwt.sign with correct payload, secret, and options on signup", async () => {
      const createdUser = {
        id: 42,
        name: "Alice",
        email: "alice@example.com",
        role: "user",
        password: "hashed",
      };

      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed");
      prisma.user.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue("t");

      await signup({ name: "Alice", email: "alice@example.com", password: "pw" });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
        },
        "test-secret",
        { expiresIn: "1h" }
      );
    });

    it("should call jwt.sign with correct payload, secret, and options on login", async () => {
      const storedUser = {
        id: 7,
        name: "Bob",
        email: "bob@example.com",
        role: "admin",
        password: "hashed",
      };

      prisma.user.findUnique.mockResolvedValue(storedUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("t");

      await login({ email: "bob@example.com", password: "pw" });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.name,
          role: storedUser.role,
        },
        "test-secret",
        { expiresIn: "1h" }
      );
    });
  });
});
