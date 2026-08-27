import prisma from '@/infrastructure/database/prisma';

export class DashboardService {
  async obtenerSituacionActual() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener registros abiertos de hoy
    const ingresosDia = await prisma.registroIngreso.findMany({
      where: {
        fechaIngreso: { gte: hoy },
      },
      include: {
        persona: {
          include: { militar: true },
        },
        vehiculo: true,
        unidadDestino: true,
        operadorIngreso: {
          select: { nombreCompleto: true },
        },
      },
    });

    const presentes = ingresosDia.filter((i) => i.estado === 'ABIERTO');
    const cerrados = ingresosDia.filter((i) => i.estado === 'CERRADO');

    // Separar militares y visitas
    const militares = presentes.filter((p) => p.persona.tipoPersona === 'MILITAR_PROPIO');
    const visitas = presentes.filter(
      (p) => p.persona.tipoPersona === 'MILITAR_EXTERNO' || p.persona.tipoPersona === 'CIVIL'
    );

    // Extraer vehículos únicos
    const vehiculosSet = new Set<string>();
    presentes.forEach((i) => {
      if (i.vehiculoId) vehiculosSet.add(i.vehiculoId);
    });

    // RN-06: Alertas de permanencia
    const ahora = new Date();
    const horaLimite = 19; // 19:00 hs
    const alertas: any[] = [];

    presentes.forEach((ingreso) => {
      const horaIngreso = ingreso.fechaIngreso;
      const horas = (ahora.getTime() - horaIngreso.getTime()) / (1000 * 60 * 60);

      if (ahora.getHours() >= horaLimite && horas > 4) {
        alertas.push({
          id: ingreso.id,
          tipo: 'PERMANENCIA_TARDÍA',
          nivel: 'ROJO',
          ingresoId: ingreso.id,
          mensaje: `${ingreso.persona.nombre} ${ingreso.persona.apellido} en el predio desde las ${ingreso.horaIngreso} (${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m)`,
          timestamp: new Date(),
        });
      }
    });

    return {
      kpis: {
        totalPersonasActuales: presentes.length,
        militaresPropio: militares.length,
        visitantes: visitas.length,
        vehiculosActuales: vehiculosSet.size,
        ingresosCerrados: cerrados.length,
      },
      presentes: presentes.map((p) => ({
        id: p.id,
        persona: {
          nombre: p.persona.nombre,
          apellido: p.persona.apellido,
          grado: p.persona.militar?.grado || '-',
        },
        horaIngreso: p.horaIngreso,
        unidad: p.unidadDestino.nombre,
        vehiculo: p.vehiculo?.dominio || null,
        estado: p.estado,
        alerta: alertas.some((a) => a.ingresoId === p.id),
      })),
      visitas,
      alertas,
      timestamp: ahora,
    };
  }
}
