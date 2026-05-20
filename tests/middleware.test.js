const jwt = require("jsonwebtoken");
const auth = require("../src/middleware/auth");
const adminAuth = require("../src/middleware/adminAuth");
const validateBooking = require("../src/middleware/validateBooking");
const validateId = require("../src/middleware/validateId");

jest.mock("jsonwebtoken");

// Helpers
function mockReq(overrides = {}) {
  return {
    body: {},
    params: {},
    cookies: {},
    header: jest.fn().mockReturnValue(undefined),
    ...overrides,
  };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext() {
  return jest.fn();
}

// ── Auth Middleware ─────────────────────────────────────────────────────────────
describe("Auth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("should deny if no token is provided", () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token, authorization denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next() with a valid token", () => {
    const payload = { id: "u1", role: "user" };
    jwt.verify.mockReturnValue(payload);

    const req = mockReq({ cookies: { token: "valid-token" } });
    const res = mockRes();
    const next = mockNext();

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it("should deny with an invalid token", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = mockReq({ cookies: { token: "bad-token" } });
    const res = mockRes();
    const next = mockNext();

    auth(req, res, next);

    expect(req.user).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token is not valid" });
    expect(next).not.toHaveBeenCalled();
  });
});

// ── Admin Auth Middleware ───────────────────────────────────────────────────────
describe("Admin Auth Middleware", () => {
  it("should deny non-admin users", () => {
    const req = mockReq({ user: { id: "u1", role: "user" } });
    const res = mockRes();
    const next = mockNext();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. Admin only." });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow admin users", () => {
    const req = mockReq({ user: { id: "a1", role: "admin" } });
    const res = mockRes();
    const next = mockNext();

    adminAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should deny if req.user is null", () => {
    const req = mockReq({ user: null });
    const res = mockRes();
    const next = mockNext();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. Admin only." });
    expect(next).not.toHaveBeenCalled();
  });
});

// ── Validate Booking Middleware ─────────────────────────────────────────────────
describe("Validate Booking Middleware", () => {
  it("should pass with all valid fields", () => {
    const req = mockReq({
      body: { trainId: "t1", passengerName: "Alice", age: 25, date: "2026-06-01" },
    });
    const res = mockRes();
    const next = mockNext();

    validateBooking(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should reject when required fields are missing", () => {
    const req = mockReq({
      body: { trainId: "t1" }, // missing passengerName, age, date
    });
    const res = mockRes();
    const next = mockNext();

    validateBooking(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "trainId, passengerName, age, and date are required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject non-numeric age", () => {
    const req = mockReq({
      body: { trainId: "t1", passengerName: "Alice", age: "abc", date: "2026-06-01" },
    });
    const res = mockRes();
    const next = mockNext();

    validateBooking(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Age must be a number" });
    expect(next).not.toHaveBeenCalled();
  });
});

// ── Validate ID Middleware ──────────────────────────────────────────────────────
describe("Validate ID Middleware", () => {
  it("should pass with a valid ID", () => {
    const req = mockReq({ params: { id: "abc123" } });
    const res = mockRes();
    const next = mockNext();

    validateId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should reject empty or missing ID", () => {
    const req = mockReq({ params: { id: "   " } });
    const res = mockRes();
    const next = mockNext();

    validateId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid ID format" });
    expect(next).not.toHaveBeenCalled();
  });
});
