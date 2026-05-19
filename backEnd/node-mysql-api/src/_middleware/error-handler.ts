
import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    if (typeof err === 'string') {
        const is404 = err.toLowerCase().endsWith('not found');
        const statusCode = is404 ? 404 : 400;
        return res.status(statusCode).json({ success: false, message: err });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const message = err?.message || 'An unexpected error occurred';
    return res.status(500).json({ success: false, message });
}