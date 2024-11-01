import 'dotenv/config';
import './config/database';
// import './config/nodemailer';
import express, { NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import router from './routes';
import { errorHandler, notFound } from './middlewares/error-handler';

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

app.use('/api/v1', router);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started and is listening on http://localhost:${PORT}`);
});
