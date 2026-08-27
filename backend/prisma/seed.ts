import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: Iniciando población de BD...');

  // 1. Crear Roles
  const rolOperador = await prisma.rol.upsert({
    where: { codigo: 'OPERADOR' },
    update: {},
    create: {
      codigo: 'OPERADOR',
      descripcion: 'Operador de guardia - Escaneo y registro de acceso',
    },
  });

  const rolSupervisor = await prisma.rol.upsert({
    where: { codigo: 'SUPERVISOR' },
    update: {},
    create: {
      codigo: 'SUPERVISOR',
      descripcion: 'Supervisor - Monitoreo y reportes',
    },
  });

  const rolAdmin = await prisma.rol.upsert({
    where: { codigo: 'ADMIN' },
    update: {},
    create: {
      codigo: 'ADMIN',
      descripcion: 'Administrador del sistema',
    },
  });

  // 2. Crear Usuarios de prueba
  const passwordHash = await bcryptjs.hash('Password123!', 10);

  const usuarioOperador = await prisma.usuario.upsert({
    where: { username: 'guardia_001' },
    update: {},
    create: {
      username: 'guardia_001',
      passwordHash,
      nombreCompleto: 'Juan Carlos Pérez',
      rolId: rolOperador.id,
      activo: true,
    },
  });

  const usuarioSupervisor = await prisma.usuario.upsert({
    where: { username: 'supervisor_001' },
    update: {},
    create: {
      username: 'supervisor_001',
      passwordHash,
      nombreCompleto: 'María García López',
      rolId: rolSupervisor.id,
      activo: true,
    },
  });

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      nombreCompleto: 'Administrador del Sistema',
      rolId: rolAdmin.id,
      activo: true,
    },
  });

  // 3. Crear Unidades (árbol jerárquico)
  const dirIntendencia = await prisma.unidad.upsert({
    where: { codigo: 'DIR_INT' },
    update: {},
    create: {
      codigo: 'DIR_INT',
      nombre: 'Dirección de Intendencia',
      tipoNivel: 'COMANDO_DIRECCION',
      esUnidadPropia: true,
      activo: true,
    },
  });

  const bin601 = await prisma.unidad.upsert({
    where: { codigo: 'BIN601' },
    update: {},
    create: {
      codigo: 'BIN601',
      nombre: 'Batallón de Infantería 601',
      tipoNivel: 'UNIDAD_ORGANISMO',
      unidadPadreId: dirIntendencia.id,
      esUnidadPropia: true,
      activo: true,
    },
  });

  const smc = await prisma.unidad.upsert({
    where: { codigo: 'SMC' },
    update: {},
    create: {
      codigo: 'SMC',
      nombre: 'Sección Militar de Control',
      tipoNivel: 'UNIDAD_ORGANISMO',
      unidadPadreId: bin601.id,
      esUnidadPropia: true,
      activo: true,
    },
  });

  // 4. Crear Sectores
  const sectorComando = await prisma.sectorDepartamento.upsert({
    where: { unidadId_codigo: { unidadId: bin601.id, codigo: 'COMANDO' } },
    update: {},
    create: {
      unidadId: bin601.id,
      codigo: 'COMANDO',
      nombre: 'Sector Comando',
      activo: true,
    },
  });

  const sectorLogistica = await prisma.sectorDepartamento.upsert({
    where: { unidadId_codigo: { unidadId: bin601.id, codigo: 'LOGISTICA' } },
    update: {},
    create: {
      unidadId: bin601.id,
      codigo: 'LOGISTICA',
      nombre: 'Sector Logística',
      activo: true,
    },
  });

  // 5. Crear Personal Militar Propio
  const personaMilitar = await prisma.persona.upsert({
    where: { dni: '38123456' },
    update: {},
    create: {
      dni: '38123456',
      nombre: 'Carlos',
      apellido: 'González',
      tipoPersona: 'MILITAR_PROPIO',
      tipoDocumento: 'DNI',
      activo: true,
      militar: {
        create: {
          grado: 'Teniente',
          situacion: 'ACTIVO',
          unidadRevistaId: bin601.id,
        },
      },
    },
  });

  // 6. Crear Personal Civil
  const personaCivil = await prisma.persona.upsert({
    where: { dni: '42987654' },
    update: {},
    create: {
      dni: '42987654',
      nombre: 'Pedro',
      apellido: 'López',
      tipoPersona: 'CIVIL',
      tipoDocumento: 'DNI',
      activo: true,
      civil: {
        create: {
          domicilio: 'Calle Falsa 123',
          localidad: 'CABA',
          provincia: 'Buenos Aires',
          telefono: '1122334455',
        },
      },
    },
  });

  // 7. Crear Vehículos
  const vehiculo1 = await prisma.vehiculo.upsert({
    where: { dominio: 'AAA123' },
    update: {},
    create: {
      dominio: 'AAA123',
      tipo: 'AUTO',
      marca: 'Renault',
      modelo: 'Sandero',
      color: 'Blanco',
      titularPersonaId: personaCivil.id,
      activo: true,
    },
  });

  console.log('✅ Seed completado exitosamente');
  console.log(`   - Roles: ${[rolOperador, rolSupervisor, rolAdmin].length}`);
  console.log(`   - Usuarios: ${[usuarioOperador, usuarioSupervisor, usuarioAdmin].length}`);
  console.log(`   - Unidades: ${[dirIntendencia, bin601, smc].length}`);
  console.log(`   - Sectores: ${[sectorComando, sectorLogistica].length}`);
  console.log(`   - Personas: ${[personaMilitar, personaCivil].length}`);
  console.log(`   - Vehículos: ${[vehiculo1].length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
