const AppError = require('../utils/AppError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

// Handle Prisma specific errors
const handlePrismaError = err => {
    if (err.code === 'P2002') {
        // Unique constraint violation
        const fields = err.meta ? err.meta.target : 'field';
        return new AppError(`Duplicate field value: ${fields}. Please use another value!`, 400);
    }
    if (err.code === 'P2025') {
        // Record not found
        return new AppError('Record not found.', 404);
    }
    return new AppError('Database error occurred', 500);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        // 1) Log error
        console.error('ERROR 💥', err);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
    console.log(err.stack); // Log full stack for debugging

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        // In production, better error handling logic
        let error = { ...err };
        error.message = err.message;

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        // Check if error is from Prisma
        if (err.code && err.code.startsWith('P')) {
            error = handlePrismaError(err);
        }

        sendErrorProd(error, res);
    }
};
