import { describe, it, expect } from 'vitest';
import { validateNoCircles } from '@/application/services/AdminService';

/**
 * validateNoCircles no depende de Prisma directamente: recibe una función
 * `obtenerPadreId` para poder testear el recorrido de ancestros con un
 * grafo en memoria, sin mockear la base de datos.
 */
function crearResolver(padres: Record<number, number | null>) {
  return async (id: number) => padres[id] ?? null;
}

describe('validateNoCircles', () => {
  it('debería permitir asignar un padre válido sin relación previa', async () => {
    // 1 (sin padre), 2 (sin padre) -> asignar 1 como padre de 2 es válido
    const obtenerPadreId = crearResolver({ 1: null, 2: null });

    const resultado = await validateNoCircles(2, 1, obtenerPadreId);

    expect(resultado).toBe(true);
  });

  it('debería rechazar que una unidad sea su propio padre', async () => {
    const obtenerPadreId = crearResolver({ 1: null });

    const resultado = await validateNoCircles(1, 1, obtenerPadreId);

    expect(resultado).toBe(false);
  });

  it('debería rechazar un ciclo directo A→B→A (B ya es padre de A, se intenta poner A como padre de B)', async () => {
    // A(1) es padre de B(2): B.unidadPadreId = 1
    const obtenerPadreId = crearResolver({ 1: null, 2: 1 });

    // Intento: asignar B(2) como padre de A(1) -> cerraría el ciclo
    const resultado = await validateNoCircles(1, 2, obtenerPadreId);

    expect(resultado).toBe(false);
  });

  it('debería rechazar un ciclo indirecto A→B→C→A', async () => {
    // A(1) padre de B(2), B(2) padre de C(3)
    const obtenerPadreId = crearResolver({ 1: null, 2: 1, 3: 2 });

    // Intento: asignar C(3) como padre de A(1) -> A→B→C→A
    const resultado = await validateNoCircles(1, 3, obtenerPadreId);

    expect(resultado).toBe(false);
  });

  it('debería permitir mover una unidad a un padre distinto que no es su descendiente', async () => {
    // Árbol: 1 (raíz) -> 2 -> 3 ; 4 (otra raíz)
    const obtenerPadreId = crearResolver({ 1: null, 2: 1, 3: 2, 4: null });

    // Mover 3 para que su padre sea 4 (rama distinta, sin relación ancestro/descendiente)
    const resultado = await validateNoCircles(3, 4, obtenerPadreId);

    expect(resultado).toBe(true);
  });

  it('debería rechazar mover una unidad para que su padre sea uno de sus propios descendientes', async () => {
    // Árbol: 1 -> 2 -> 3
    const obtenerPadreId = crearResolver({ 1: null, 2: 1, 3: 2 });

    // Intento: asignar 3 (nieto de 1) como padre de 1 -> ciclo
    const resultado = await validateNoCircles(1, 3, obtenerPadreId);

    expect(resultado).toBe(false);
  });
});
