import prisma from '@/infrastructure/database/prisma';
import { Prisma } from '@prisma/client';

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  tipoPersona?: string;
  unidadId?: number;
}

export class ReportsService {
  async getRegistros(filtros: FiltrosReporte) {
    const where: Prisma.RegistroIngresoWhereInput = {};

    if (filtros.fechaInicio || filtros.fechaFin) {
      where.fechaIngreso = {};
      if (filtros.fechaInicio) {
        where.fechaIngreso.gte = new Date(filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        // Incluir todo el día de fechaFin (hasta las 23:59:59.999)
        const fin = new Date(filtros.fechaFin);
        fin.setHours(23, 59, 59, 999);
        where.fechaIngreso.lte = fin;
      }
    }

    if (filtros.tipoPersona) {
      where.persona = { tipoPersona: filtros.tipoPersona as any };
    }

    if (filtros.unidadId) {
      where.unidadDestinoId = filtros.unidadId;
    }

    const registros = await prisma.registroIngreso.findMany({
      where,
      include: {
        persona: true,
        unidadDestino: true,
        vehiculo: true,
      },
      orderBy: { fechaIngreso: 'desc' },
      take: 1000,
    });

    const cerrados = registros.filter((r) => r.estado === 'CERRADO' && r.fechaEgreso);
    const promedioPermanenciaMinutos =
      cerrados.length > 0
        ? cerrados.reduce((acc, r) => {
            const minutos = (r.fechaEgreso!.getTime() - r.fechaIngreso.getTime()) / (1000 * 60);
            return acc + minutos;
          }, 0) / cerrados.length
        : 0;

    return {
      registros: registros.map((r) => ({
        id: r.id,
        fechaIngreso: r.fechaIngreso.toISOString(),
        horaIngreso: r.horaIngreso,
        horaEgreso: r.horaEgreso,
        personaNombre: r.persona?.nombre,
        personaApellido: r.persona?.apellido,
        tipoPersona: r.persona?.tipoPersona,
        unidadDestino: r.unidadDestino?.nombre,
        estado: r.estado,
        vehiculo: r.vehiculo?.dominio,
      })),
      total: registros.length,
      abiertos: registros.filter((r) => r.estado === 'ABIERTO').length,
      cerrados: cerrados.length,
      promedioPermanencia: Math.round(promedioPermanenciaMinutos),
    };
  }

  async getStats() {
    const registros = await prisma.registroIngreso.findMany({
      include: { persona: true, unidadDestino: true },
    });

    const registrosPorTipo: Record<string, number> = {};
    const registrosPorHora: Record<string, number> = {};
    const visitantesPorUnidad: Record<string, number> = {};

    registros.forEach((r) => {
      // Por tipo
      const tipo = r.persona?.tipoPersona || 'Desconocido';
      registrosPorTipo[tipo] = (registrosPorTipo[tipo] || 0) + 1;

      // Por hora (HH del campo horaIngreso "HH:MM")
      if (r.horaIngreso) {
        const hora = r.horaIngreso.substring(0, 2);
        registrosPorHora[hora] = (registrosPorHora[hora] || 0) + 1;
      }

      // Por unidad (solo visitantes: militar externo o civil)
      if (r.persona?.tipoPersona === 'MILITAR_EXTERNO' || r.persona?.tipoPersona === 'CIVIL') {
        const unidad = r.unidadDestino?.nombre || 'Desconocida';
        visitantesPorUnidad[unidad] = (visitantesPorUnidad[unidad] || 0) + 1;
      }
    });

    return {
      totalRegistros: registros.length,
      registrosPorTipo,
      registrosPorHora,
      visitantesPorUnidad,
    };
  }
}
