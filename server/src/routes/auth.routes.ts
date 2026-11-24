import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }

  // Check credentials against environment variables or default secrets
  const expectedUser = (process.env.ADMIN_USERNAME || 'shahad').trim().toLowerCase();
  const expectedPass = process.env.ADMIN_PASSWORD || 'najad';

  if (username.trim().toLowerCase() === expectedUser && password === expectedPass) {
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        username: expectedUser,
        displayName: expectedUser.charAt(0).toUpperCase() + expectedUser.slice(1),
        token: 'token_' + expectedUser + '_' + Date.now(),
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password',
  });
});

export default router;
