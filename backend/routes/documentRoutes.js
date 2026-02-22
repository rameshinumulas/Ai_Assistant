import express from 'express';
import { uploadDocument, getDocuments, getDocumentById, deleteDocument } from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';
import { get } from 'mongoose';

const router = express.Router();

// All are protected routes
router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

export default router