// Exportar todas las interfaces
export interface IPersonaRepository {
  findByDni(dni: string): Promise<any>;
  findById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export interface IIngresoRepository {
  findActiveByDni(dni: string): Promise<any>;
  findById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  findByDateRange(desde: Date, hasta: Date): Promise<any[]>;
  findByEstado(estado: string): Promise<any[]>;
}

export interface IVehicleRepository {
  findByDominio(dominio: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export interface IUsuarioRepository {
  findByUsername(username: string): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export interface IAuditLogRepository {
  create(data: any): Promise<any>;
  findRecent(limit: number): Promise<any[]>;
}

export interface IUnidadRepository {
  findById(id: number): Promise<any>;
  findByArbol(): Promise<any>;
  findAll(): Promise<any[]>;
}

export interface ITokenService {
  generateAccessToken(usuarioId: string, rol: string, username: string): string;
  generateRefreshToken(usuarioId: string): string;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
}
