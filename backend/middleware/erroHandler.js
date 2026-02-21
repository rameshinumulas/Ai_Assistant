const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValye)[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'validationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        message='file size exceeds the maximum limit of 10MB';
        statusCode = 400;
    };

    //JWT errors
    if (err.name === 'JsonWebTokenError') {
        message - 'Invalid token';
        statusCode = 400
    }

    if (err.name === 'TokenExpireError') {
        message = 'Token expired';
        statusCode = 400;
    }

    console.error('Error', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

export default errorHandler;