import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { SituacionActual } from '@/types';

const useSituacionActualMock = vi.fn();
vi.mock('@/api/hooks/useDashboard', () => ({
  useSituacionActual: () => useSituacionActualMock(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    usuario: { nombreCompleto: 'Maria Garcia', rol: 'SUPERVISOR' },
    logout: vi.fn(),
  }),
}));

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

const situacionMock: SituacionActual = {
  kpis: {
    totalPersonasActuales: 2,
    militaresPropio: 1,
    visitantes: 1,
    vehiculosActuales: 1,
    ingresosCerrados: 3,
  },
  presentes: [
    {
      id: 'ingreso-1',
      persona: { nombre: 'Carlos', apellido: 'Gonzalez', grado: 'Teniente' },
      horaIngreso: '15:30',
      unidad: 'Batallón de Infantería 601',
      vehiculo: 'AAA123',
      estado: 'ABIERTO',
      alerta: false,
    },
    {
      id: 'ingreso-2',
      persona: { nombre: 'Ana', apellido: 'Martinez' },
      horaIngreso: '10:00',
      unidad: 'Batallón de Infantería 601',
      estado: 'ABIERTO',
      alerta: true,
    },
  ],
  visitas: [],
  alertas: [
    {
      id: 'ingreso-2',
      tipo: 'PERMANENCIA_TARDÍA',
      nivel: 'ROJO',
      mensaje: 'Ana Martinez en el predio desde las 10:00 (9h 30m)',
      timestamp: '2026-08-27T19:30:00Z',
    },
  ],
  timestamp: '2026-08-27T19:30:00Z',
};

describe('DashboardPage', () => {
  it('debería mostrar el mensaje de carga mientras isLoading es true', () => {
    useSituacionActualMock.mockReturnValue({ data: undefined, isLoading: true, error: null });
    renderDashboard();
    expect(screen.getByText(/Cargando dashboard/i)).toBeInTheDocument();
  });

  it('debería mostrar un error si la carga falla', () => {
    useSituacionActualMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    });
    renderDashboard();
    expect(screen.getByText(/Error al cargar dashboard/i)).toBeInTheDocument();
  });

  it('debería renderizar los KPIs y la tabla de presentes', () => {
    useSituacionActualMock.mockReturnValue({ data: situacionMock, isLoading: false, error: null });
    renderDashboard();

    expect(screen.getByText('2')).toBeInTheDocument(); // totalPersonasActuales
    expect(screen.getByText('Carlos Gonzalez')).toBeInTheDocument();
    expect(screen.getByText('Ana Martinez')).toBeInTheDocument();
    expect(screen.getByText('AAA123')).toBeInTheDocument();
  });

  it('debería mostrar el badge de alerta para presentes marcados con alerta:true', () => {
    useSituacionActualMock.mockReturnValue({ data: situacionMock, isLoading: false, error: null });
    renderDashboard();

    // Hay dos ocurrencias de "Alerta": el título de la sección de alertas
    // ("⚠️ Alertas de Permanencia") y el badge de la fila ("⚠️ Alerta").
    const ocurrencias = screen.getAllByText((_, node) => node?.textContent === '⚠️ Alerta');
    expect(ocurrencias.length).toBeGreaterThan(0);
    expect(screen.getByText('Presente')).toBeInTheDocument();
  });

  it('debería mostrar la sección de alertas de permanencia cuando hay alertas', () => {
    useSituacionActualMock.mockReturnValue({ data: situacionMock, isLoading: false, error: null });
    renderDashboard();

    expect(screen.getByText(/Alertas de Permanencia/i)).toBeInTheDocument();
    expect(screen.getByText(/Ana Martinez en el predio/i)).toBeInTheDocument();
  });

  it('debería mostrar mensaje vacío cuando no hay personas presentes', () => {
    useSituacionActualMock.mockReturnValue({
      data: { ...situacionMock, presentes: [], alertas: [] },
      isLoading: false,
      error: null,
    });
    renderDashboard();

    expect(screen.getByText(/No hay personas presentes/i)).toBeInTheDocument();
  });
});
