import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import accountService from './account.service';

function getTokenFromRequest(req: Request) {
  const token = req.body?.token || req.query?.token || req.params?.token;
  return typeof token === 'string' ? token.trim() : undefined;
}

export function validateResetTokenSchema(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
    token: Joi.string().required()
  });

  const token = getTokenFromRequest(req);
  if (!token) {
    return next('Validation error: token is required');
  }

  req.body = { ...req.body, token };
  validateRequest(req, next, schema);
}

export async function validateResetToken(req: Request, res: Response, next: NextFunction) {
  const token = req.body?.token || getTokenFromRequest(req);
  console.log('[validateResetToken] Token received:', token);

  try {
    if (!token) {
      console.error('[validateResetToken] FAIL: Token is missing');
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const account = await accountService.validateResetToken({ token });
    console.log('[validateResetToken] SUCCESS: Token validated for user:', { id: account.id, email: account.email });
    return res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    const message = typeof error === 'string' ? error : error?.message || 'Invalid or expired token';
    console.error('[validateResetToken] FAIL:', { token, message, error });
    return res.status(400).json({ success: false, message });
  }
}

export function resetPasswordSchema(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });

  const token = getTokenFromRequest(req);
  if (token) {
    req.body = { ...req.body, token };
  }

  validateRequest(req, next, schema);
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  const token = req.body?.token || getTokenFromRequest(req);
  const password = req.body?.password;
  console.log('[resetPassword] Token and password received');

  try {
    if (!token || !password) {
      console.error('[resetPassword] FAIL: Token or password is missing', { hasToken: !!token, hasPassword: !!password });
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }

    const result = await accountService.resetPassword({ token, password });
    console.log('[resetPassword] SUCCESS: Password reset for user:', { email: result.email });
    return res.json({ success: true, message: 'Password reset successful, you can now login' });
  } catch (error) {
    const message = typeof error === 'string' ? error : error?.message || 'Password reset failed';
    console.error('[resetPassword] FAIL: Password reset failed', { message, error });
    return res.status(400).json({ success: false, message });
  }
}

function validateRequest(req: any, next: any, schema: any) {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  };

  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return next(`Validation error: ${error.details.map((x: any) => x.message).join(', ')}`);
  }

  req.body = value;
  next();
}
