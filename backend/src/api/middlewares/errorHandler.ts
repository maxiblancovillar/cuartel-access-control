import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DomainException } from '@/domain/errors/DomainException';
import { ValidationException } from '@/domain/errors/ValidationException';

export function errorHandler(
  err: Error | DomainException,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // ValidationException se chequea antes de la rama genérica de DomainException
  // porque además de code/message trae los fieldErrors por campo (igual que el
  // caso de ZodError más abajo). Sin esto el cliente solo recibía el mensaje
  // genérico "Errores de validación en los datos enviados" sin saber qué campo
  // falló (p. ej. "username ya está en uso" al crear un usuario duplicado).
  if (err instanceof ValidationException) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      details: err.fieldErrors,
    });
  }

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
