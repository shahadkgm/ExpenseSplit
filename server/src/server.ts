import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import expenseRoutes from './routes/expense.routes';
import groupRoutes from './routes/group.routes';
import authRoutes from './routes/auth.routes';
import path from 'path';

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Expense Calculator API',
  });
});

// Serve frontend production build if available
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  const indexFile = path.join(clientDist, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(200).send('Expense Calculator API is running.');
    }
  });
});

// Start Server
export const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

export default app;
