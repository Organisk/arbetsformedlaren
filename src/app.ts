import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4443;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Arbetsförmedlaren API v1' });
});

// API routes will be added here
// app.use('/api/jobs', require('./routes/jobs').default));
// app.use('/api/matches', require('./routes/matches').default));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Arbetsförmedlaren running at http://localhost:${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/health`);
});

export default app;
