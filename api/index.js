import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes.js';
import paymentHandler from './payment.js';
import imagekitAuthHandler from './imagekit-auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mount DB REST API Router
app.use('/api', apiRouter);

// Wrapper to handle Vercel-style handlers in Express
const vercelWrapper = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

app.post('/api/payment', vercelWrapper(paymentHandler));
app.get('/api/imagekit-auth', vercelWrapper(imagekitAuthHandler));

export default app;
