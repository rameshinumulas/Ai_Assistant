import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true , 'Please provide Document title'],
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true
    },
    extractedText: {
        type: String,
        default: ''
    },
    chunks: [{
        content: {
            type: String,
            required: true
        },
        pageNumber: {
            type: Number,
            required: true
        },
        chunkIndex: {
            type: Number,
            required: true
        }
    }],
    updatedDate: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    }
}, {
    timestamps: true
});

// Index for faster retrieval of user documents
documentSchema.index({ userId: 1, updatedDate: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;