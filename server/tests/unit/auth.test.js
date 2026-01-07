// tests/unit/auth.test.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../../server/utils/auth');

describe('Unit: Authentication Utilities', () => {
  
  describe('Password Hashing', () => {
    const plainPassword = 'Test@123';
    let hashedPassword;

    it('should hash password correctly', async () => {
      hashedPassword = await hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it('should compare password correctly', async () => {
      const isMatch = await comparePassword(plainPassword, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    it('should fail comparison with wrong password', async () => {
      const isMatch = await comparePassword('WrongPassword', hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('JWT Token Generation', () => {
    const userData = {
      user_id: 1,
      email: 'test@example.com',
      username: 'testuser'
    };

    it('should generate a valid JWT token', () => {
      const token = generateToken(userData);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify valid token', () => {
      const token = generateToken(userData);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.user_id).toBe(userData.user_id);
      expect(decoded.email).toBe(userData.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with 1ms expiry
      const token = jwt.sign(userData, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '1ms'
      });

      // Wait for token to expire
      setTimeout(() => {
        expect(() => verifyToken(token)).toThrow();
      }, 10);
    });
  });

  describe('Password Validation', () => {
    const { validatePassword } = require('../../server/utils/validators');

    it('should accept valid password', () => {
      const result = validatePassword('Test@123');
      expect(result.valid).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('test@123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Test1234');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });

    it('should reject short password', () => {
      const result = validatePassword('Test@1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 characters');
    });
  });

  describe('Email Validation', () => {
    const { validateEmail } = require('../../server/utils/validators');

    it('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('Token Middleware', () => {
    const { authenticateToken } = require('../../server/middleware/auth.middleware');
    
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should call next() for valid token', () => {
      const token = generateToken({ user_id: 1, email: 'test@example.com' });
      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should return 401 for missing token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it('should return 403 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});