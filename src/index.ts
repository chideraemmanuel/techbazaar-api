import 'dotenv/config';
import './config/database';
// import './config/nodemailer';
import express, { NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import router from './routes';
import { errorHandler, notFound } from './middlewares/error-handler';
import { updateSession } from './middlewares/session';
import rateLimit from 'express-rate-limit';

const app = express();

const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const limiter = rateLimit({
  windowMs: 1000 * 60, // 1 minute
  limit: 200,
  message: { error: 'Too many requests, please try again later.' },
});

// app.use('/api/v1', limiter, updateSession, router);
app.use('/api/v1', limiter, router);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started and is listening on http://localhost:${PORT}`);
});

export default app;
