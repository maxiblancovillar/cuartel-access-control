import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DomainException } from '@/domain/errors/DomainException';

export function errorHandler(
  err: Error | DomainException,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof DomainException) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Errores de validación en los datos enviados',
      details: err.flatten().fieldErrors,
    });
  }

  console.error('Unexpected error:', err);

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
  });
}
