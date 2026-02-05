import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Set up test environment variable
process.env.JWT_SECRET = 'test-secret-key';

describe('Auth - Password Hashing', () => {
  
  test('should hash a password and not store it as plain text', async () => {
    const password = 'myPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Hashed password should NOT equal the plain text
    expect(hashedPassword).not.toBe(password);
  });

  test('should verify a correct password against its hash', async () => {
    const password = 'myPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('should reject an incorrect password', async () => {
    const password = 'myPassword123';
    const wrongPassword = 'wrongPassword';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });
});

describe('Auth - JWT Token', () => {

  test('should create a valid JWT token with userId', () => {
    const userId = '12345';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    // Token should be a string
    expect(typeof token).toBe('string');
    
    // Decode and verify it contains the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    expect(decoded.userId).toBe(userId);
  });

  test('should reject a token with wrong secret', () => {
    const token = jwt.sign({ userId: '12345' }, process.env.JWT_SECRET!);
    
    // Verifying with wrong secret should throw
    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });

  test('should reject an expired token', () => {
    const token = jwt.sign(
      { userId: '12345' },
      process.env.JWT_SECRET!,
      { expiresIn: '0s' } // expires immediately
    );

    expect(() => {
      jwt.verify(token, process.env.JWT_SECRET!);
    }).toThrow();
  });
});
