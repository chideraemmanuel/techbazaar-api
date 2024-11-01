import multer from 'multer';
import { MAX_FILE_SIZE } from '../schemas/constants';

const storage = multer.memoryStorage();

export const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

export type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
