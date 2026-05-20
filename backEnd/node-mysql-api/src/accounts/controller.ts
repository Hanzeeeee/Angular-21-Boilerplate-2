import express from 'express';

const router = express.Router();

import Joi from 'joi';
import validateRequest from '../_middleware/validate-request';
import authorize from '../_middleware/authorize';
import Role from '../_helpers/role';
import accountService from './account.service';
import config from '../../config';

/**
 * @openapi
 * tags:
 *   - name: Accounts
 *     description: Account and authentication endpoints
 */

/**
 * @openapi
 * /accounts/authenticate:
 *   post:
 *     tags: [Accounts]
 *     summary: Authenticate user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Authentication successful
 */

/**
 * @openapi
 * /accounts/register:
 *   post:
 *     tags: [Accounts]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               acceptTerms:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Registration successful
 */

/**
 * @openapi
 * /accounts/verify-email:
 *   get:
 *     tags: [Accounts]
 *     summary: Verify email via token (query)
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: Verification successful
 *   post:
 *     tags: [Accounts]
 *     summary: Verify email via token (body)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Verification successful
 */

/**
 * @openapi
 * /accounts/forgot-password:
 *   post:
 *     tags: [Accounts]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset email sent
 */

/**
 * @openapi
 * /accounts/validate-reset-token:
 *   post:
 *     tags: [Accounts]
 *     summary: Validate reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Token is valid
 *   get:
 *     tags: [Accounts]
 *     summary: Validate reset token (query)
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 */

/**
 * @openapi
 * /accounts/reset-password:
 *   post:
 *     tags: [Accounts]
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 */


router.post('/authenticate', authenticateSchema, authenticate);
router.post('/login', authenticateSchema, authenticate);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.post('/register', registerSchema, register);
router.get('/verify-email', verifyEmailQuerySchema, verifyEmailQuery);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.get('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.get('/validate-reset-token/:token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);

router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

export default router;

function authenticateSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

async function authenticate(req: any, res: any, next: any) {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const result: any = await accountService.authenticate({ email, password, ipAddress });
    const { refreshToken, jwtToken, ...user } = result;
    setTokenCookie(res, refreshToken);
    return res.json({
      success: true,
      message: 'Login successful',
      jwtToken,
      user
    });
  } catch (error) {
    return next(error);
  }
}

async function refreshToken(req: any, res: any, next: any) {
  try {
    const token = req.cookies.refreshToken || req.body.token;
    const ipAddress = req.ip;
    const result: any = await accountService.refreshToken({ token, ipAddress });
    setTokenCookie(res, result.refreshToken);
    return res.json({ success: true, message: 'Token refreshed', user: result });
  } catch (error) {
    next(error);
  }
}

function revokeTokenSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    token: Joi.string().empty('')
  });
  validateRequest(req, next, schema);
}

async function revokeToken(req: any, res: any, next: any) {
  try {
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    if (!req.auth.ownsToken(token) && req.auth.role !== Role.Admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await accountService.revokeToken({ token, ipAddress });
    return res.json({ success: true, message: 'Token revoked' });
  } catch (error) {
    next(error);
  }
}

function registerSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    title: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    acceptTerms: Joi.boolean().valid(true).required()
  });
  validateRequest(req, next, schema);
}

async function register(req: any, res: any, next: any) {
  try {
    const backendOrigin = `${req.protocol}://${req.get('host')}`;
    const result: any = await accountService.register(req.body, backendOrigin);
    return res.json({
      success: result?.success !== false,
      message: result?.message || 'Registration successful, please check your email for verification instructions'
    });
  } catch (error) {
    next(error);
  }
}

function verifyEmailSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    token: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

function verifyEmailQuerySchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    token: Joi.string().required()
  });
  validateRequest(req, next, schema, 'query');
}

async function verifyEmailQuery(req: any, res: any, next: any) {
  try {
    // Use validated query data (from validate-request middleware)
    const result: any = await accountService.verifyEmail(req.validatedQuery);
    return res.json({ success: true, message: result?.message || 'Verification successful, you can now login' });
  } catch (error) {
    const message = typeof error === 'string' ? error : error?.message || 'Verification failed';
    console.error('verifyEmailQuery error:', error);
    return res.status(400).json({ success: false, message });
  }
}

async function verifyEmail(req: any, res: any, next: any) {
  try {
    const result: any = await accountService.verifyEmail(req.body);
    return res.json({ success: true, message: result?.message || 'Verification successful, you can now login' });
  } catch (error) {
    const message = typeof error === 'string' ? error : error?.message || 'Verification failed';
    console.error('verifyEmail error:', error);
    return res.status(400).json({ success: false, message });
  }
}

function forgotPasswordSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  validateRequest(req, next, schema);
}

async function forgotPassword(req: any, res: any, next: any) {
  try {
    const result: any = await accountService.forgotPassword(req.body, req.get('origin'));
    return res.json({
      success: result?.success !== false,
      message: result?.message || 'Please check your email for password reset instructions'
    });
  } catch (error) {
    next(error);
  }
}

function validateResetTokenSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    token: Joi.string().required()
  });

  const token = req.body?.token || req.query?.token || req.params?.token;
  if (!token || typeof token !== 'string') {
    return next('Validation error: token is required');
  }

  req.body = { ...req.body, token };
  validateRequest(req, next, schema);
}

async function validateResetToken(req: any, res: any, next: any) {
  try {
    await accountService.validateResetToken({ token: req.body.token });
    return res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    const message = typeof error === 'string' ? error : error?.message || 'Invalid or expired token';
    return res.status(400).json({ success: false, message });
  }
}

function resetPasswordSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });
  validateRequest(req, next, schema);
}

async function resetPassword(req: any, res: any, next: any) {
  try {
    await accountService.resetPassword(req.body);
    return res.json({ success: true, message: 'Password reset successful, you can now login' });
  } catch (error) {
    next(error);
  }
}

function getAll(req: any, res: any, next: any) {
  accountService
    .getAll()
    .then((accounts: any) => res.json(accounts))
    .catch(next);
}

function getById(req: any, res: any, next: any) {
  if (Number(req.params.id) !== req.auth.id && req.auth.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  accountService
    .getById(req.params.id)
    .then((account: any) => account ? res.json(account) : res.sendStatus(404))
    .catch(next);
}

function createSchema(req: any, res: any, next: any) {
  const schema = Joi.object({
    title: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid(Role.Admin, Role.User).required()
  });
  validateRequest(req, next, schema);
}

function create(req: any, res: any, next: any) {
  accountService
    .create(req.body)
    .then((account: any) => res.json(account))
    .catch(next);
}

function updateSchema(req: any, res: any, next: any) {
  const schemaRules: any = {
    title: Joi.string().empty(''),
    firstName: Joi.string().empty(''),
    lastName: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
  };

  if (req.auth.role === Role.Admin) {
    schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
  }

  const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
  validateRequest(req, next, schema);
}

function update(req: any, res: any, next: any) {
  if (Number(req.params.id) !== req.auth.id && req.auth.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  accountService
    .update(req.params.id, req.body)
    .then((account: any) => res.json(account))
    .catch(next);
}

function _delete(req: any, res: any, next: any) {
  if (Number(req.params.id) !== req.auth.id && req.auth.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  accountService
    .delete(req.params.id)
    .then(() => res.json({ message: 'Account deleted successfully' }))
    .catch(next);
}

function setTokenCookie(res: any, token: any) {
  const secure = config.cookieSecure;
  const cookieOptions = {
    httpOnly: true,
    sameSite: config.cookieSameSite as 'lax' | 'strict' | 'none',
    secure,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
  res.cookie('refreshToken', token, cookieOptions);
}