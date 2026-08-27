// Auth
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    username: string;
    nombreCompleto: string;
    rol: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
    activo: boolean;
  };
}

export interface AuthContextType {
  usuario: LoginResponse['usuario'] | null;
  accessToken: string | null;
  isLoading: boolean;
  /** true mientras se rehidrata la sesión desde localStorage al montar la app. */
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<LoginResponse['usuario']>;
  logout: () => void;
}

// Personas
export interface Persona {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  tipoPersona: 'MILITAR_PROPIO' | 'MILITAR_EXTERNO' | 'CIVIL';
  tipoDocumento: string;
  militar?: {
    grado: string;
    situacion: string;
    unidadRevista: {
      id: number;
      codigo: string;
      nombre: string;
      esUnidadPropia: boolean;
    };
  };
  civil?: {
    domicilio?: string;
    localidad?: string;
    provincia?: string;
    telefono?: string;
  };
  ingresoActivo?: RegistroIngreso | null;
  permiteIngreso?: boolean;
}

// Vehículos
export interface Vehiculo {
  id: string;
  dominio: string;
  tipo: 'AUTO' | 'CAMIONETA' | 'MOTO' | 'CAMION' | 'UTILITARIO' | 'OTRO';
  marca: string;
  modelo?: string;
  color: string;
  titularPersonaId?: string;
}

// Registros de Ingreso
export interface RegistroIngreso {
  id: string;
  fichaNro?: number | null;
  personaId: string;
  vehiculoId?: string | null;
  unidadDestinoId: number;
  sectorId?: number | null;
  fechaIngreso: string;
  fechaEgreso?: string | null;
  horaIngreso?: string;
  horaEgreso?: string | null;
  estado: 'ABIERTO' | 'CERRADO' | 'ANULADO';
  persona: Persona;
  vehiculo?: Vehiculo | null;
  unidadDestino: {
    id: number;
    nombre: string;
  };
  detalleVisita?: DetalleVisita;
}

export interface DetalleVisita {
  id: string;
  ingresoId: string;
  procedencia: string;
  personaVisitada: string;
  motivoVisita: string;
}

// Unidades
export interface Unidad {
  id: number;
  codigo: string;
  nombre: string;
  tipoNivel: string;
  esUnidadPropia: boolean;
  subunidades?: Unidad[];
  sectores?: {
    id: number;
    codigo: string;
    nombre: string;
  }[];
}

// Dashboard
export interface SituacionActual {
  kpis: {
    totalPersonasActuales: number;
    militaresPropio: number;
    visitantes: number;
    vehiculosActuales: number;
    ingresosCerrados: number;
  };
  presentes: Array<{
    id: string;
    persona: {
      nombre: string;
      apellido: string;
      grado?: string;
    };
    horaIngreso: string;
    unidad: string;
    vehiculo?: string;
    estado: string;
    alerta: boolean;
  }>;
  visitas: unknown[];
  alertas: Array<{
    id: string;
    tipo: string;
    nivel: string;
    mensaje: string;
    timestamp: string;
  }>;
  timestamp: string;
}
