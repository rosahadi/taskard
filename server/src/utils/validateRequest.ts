import { Request } from 'express';
import { ZodSchema } from 'zod';
import AppError from './appError';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (req: Request, schemas: ValidationSchemas) => {
  if (schemas.body) {
    const parsedBody = schemas.body.safeParse(req.body);
    if (!parsedBody.success) {
      const errors = parsedBody.error.errors.map((err) => err.message);
      throw new AppError(`Validation error: ${errors.join(', ')}`, 400);
    }
  }

  if (schemas.params) {
    const parsedParams = schemas.params.safeParse(req.params);
    if (!parsedParams.success) {
      const errors = parsedParams.error.errors.map((err) => err.message);
      throw new AppError(`Validation error: ${errors.join(', ')}`, 400);
    }
  }

  if (schemas.query) {
    const parsedQuery = schemas.query.safeParse(req.query);
    if (!parsedQuery.success) {
      const errors = parsedQuery.error.errors.map((err) => err.message);
      throw new AppError(`Validation error: ${errors.join(', ')}`, 400);
    }
  }
};
