import Document from "../Models/Document.js";
import FlashCard from "../Models/FlashCard.js";
import Quiz from "../Models/Quiz.js";

import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

// @desc Upload PDF document
// @route POST api/documents/upload
// access Private

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
        statusCode: 400,
      });
    }
    const { title } = req.body;
    if (!title) {
      // cleanup uploaded file if title is missing
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: "Title is required",
        statusCode: 400,
      });
    }

    // Construct the URL for the uploaded file
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Create document record

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.filename,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process PDF in the background (in Production, use a queue like Bull)
    processPDF(document._id, req.file.path).catch((error) => {
      console.error("Error processing PDF:", error);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully, processing in background",
    });
  } catch (error) {
    // cleanup file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Helper function to process PDF and update document record
const processPDF = async (documentId, filePath) => {
  try {
    const { text, numPages } = await extractTextFromPDF(filePath);

    // create chunks
    const chunks = chunkText(text, 500, 50);

    // Update Document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "completed",
    });

    console.log(
      `Document ${documentId} processed successfully with ${chunks.length} chunks.`,
    );
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc Get all documents for the authenticated user
// @route GET api/documents
// access Private

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashCardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizSets",
        },
      },
      {
        $addFields: {
          flashCardCount: { $size: "$flashCardSets" },
          quizCount: { $size: "$quizSets" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashCardSets: 0,
          quizSets: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    // cleanup file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// @desc Get document by ID
// @route GET api/documents/:id
// access Private

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardCount = await FlashCard.countDocuments({ documentId: document._id, userId: req.user._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

    // Update Last accessed
    document.lastAccessed = Date.now();
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    documentData.flashCardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });

  } catch (error) {
    next(error);
  }
};

// @desc Delete document by ID
// @route DELETE api/documents/:id
// access Private

export const deleteDocument = async (req, res, next) => {
  try {

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }
 // Delete file from fileSystem
    await fs.unlink(document.filePath).catch(() => {});


    // delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

