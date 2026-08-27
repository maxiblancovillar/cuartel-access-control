-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('MILITAR_PROPIO', 'MILITAR_EXTERNO', 'CIVIL');

-- CreateEnum
CREATE TYPE "SituacionMilitar" AS ENUM ('ACTIVO', 'RETIRADO', 'LICENCIA');

-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('AUTO', 'CAMIONETA', 'MOTO', 'CAMION', 'UTILITARIO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoIngreso" AS ENUM ('ABIERTO', 'CERRADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "TipoNivelOrganico" AS ENUM ('COMANDO_DIRECCION', 'UNIDAD_ORGANISMO', 'SEDE_EXTERNA');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nombre_completo" VARCHAR(120) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "tipo_nivel" "TipoNivelOrganico" NOT NULL DEFAULT 'UNIDAD_ORGANISMO',
    "unidad_padre_id" INTEGER,
    "es_unidad_propia" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectores_departamentos" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sectores_departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" UUID NOT NULL,
    "tipo_documento" VARCHAR(10) NOT NULL DEFAULT 'DNI',
    "dni" VARCHAR(15) NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "apellido" VARCHAR(80) NOT NULL,
    "tipo_persona" "TipoPersona" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_militar" (
    "id" UUID NOT NULL,
    "grado" VARCHAR(50) NOT NULL,
    "situacion" "SituacionMilitar" NOT NULL DEFAULT 'ACTIVO',
    "unidad_revista_id" INTEGER NOT NULL,

    CONSTRAINT "personal_militar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_civil" (
    "id" UUID NOT NULL,
    "domicilio" VARCHAR(150),
    "localidad" VARCHAR(100),
    "provincia" VARCHAR(100),
    "telefono" VARCHAR(30),

    CONSTRAINT "personal_civil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" UUID NOT NULL,
    "dominio" VARCHAR(15) NOT NULL,
    "tipo" "TipoVehiculo" NOT NULL DEFAULT 'AUTO',
    "marca" VARCHAR(60) NOT NULL,
    "modelo" VARCHAR(60),
    "color" VARCHAR(40) NOT NULL,
    "titular_persona_id" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_ingresos" (
    "id" UUID NOT NULL,
    "ficha_nro" INTEGER,
    "persona_id" UUID NOT NULL,
    "vehiculo_id" UUID,
    "unidad_destino_id" INTEGER NOT NULL,
    "sector_id" INTEGER,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_egreso" TIMESTAMP(3),
    "hora_ingreso" VARCHAR(10),
    "hora_egreso" VARCHAR(10),
    "estado" "EstadoIngreso" NOT NULL DEFAULT 'ABIERTO',
    "operador_ingreso_id" UUID NOT NULL,
    "operador_egreso_id" UUID,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_ingresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_visitas" (
    "id" UUID NOT NULL,
    "ingreso_id" UUID NOT NULL,
    "procedencia" VARCHAR(150) NOT NULL,
    "persona_visitada" VARCHAR(120) NOT NULL,
    "motivo_visita" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalles_visitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE INDEX "usuarios_activo_idx" ON "usuarios"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_codigo_key" ON "unidades"("codigo");

-- CreateIndex
CREATE INDEX "unidades_codigo_idx" ON "unidades"("codigo");

-- CreateIndex
CREATE INDEX "unidades_activo_idx" ON "unidades"("activo");

-- CreateIndex
CREATE INDEX "sectores_departamentos_unidad_id_idx" ON "sectores_departamentos"("unidad_id");

-- CreateIndex
CREATE UNIQUE INDEX "sectores_departamentos_unidad_id_codigo_key" ON "sectores_departamentos"("unidad_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- CreateIndex
CREATE INDEX "personas_dni_idx" ON "personas"("dni");

-- CreateIndex
CREATE INDEX "personas_tipo_persona_idx" ON "personas"("tipo_persona");

-- CreateIndex
CREATE INDEX "personal_militar_unidad_revista_id_idx" ON "personal_militar"("unidad_revista_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_dominio_key" ON "vehiculos"("dominio");

-- CreateIndex
CREATE INDEX "vehiculos_dominio_idx" ON "vehiculos"("dominio");

-- CreateIndex
CREATE INDEX "vehiculos_titular_persona_id_idx" ON "vehiculos"("titular_persona_id");

-- CreateIndex
CREATE INDEX "registros_ingresos_fecha_ingreso_idx" ON "registros_ingresos"("fecha_ingreso");

-- CreateIndex
CREATE INDEX "registros_ingresos_estado_idx" ON "registros_ingresos"("estado");

-- CreateIndex
CREATE INDEX "registros_ingresos_persona_id_idx" ON "registros_ingresos"("persona_id");

-- CreateIndex
CREATE INDEX "registros_ingresos_vehiculo_id_idx" ON "registros_ingresos"("vehiculo_id");

-- CreateIndex
CREATE INDEX "registros_ingresos_unidad_destino_id_idx" ON "registros_ingresos"("unidad_destino_id");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_visitas_ingreso_id_key" ON "detalles_visitas"("ingreso_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_unidad_padre_id_fkey" FOREIGN KEY ("unidad_padre_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectores_departamentos" ADD CONSTRAINT "sectores_departamentos_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_id_fkey" FOREIGN KEY ("id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_unidad_revista_id_fkey" FOREIGN KEY ("unidad_revista_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_civil" ADD CONSTRAINT "personal_civil_id_fkey" FOREIGN KEY ("id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_titular_persona_id_fkey" FOREIGN KEY ("titular_persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ingresos" ADD CONSTRAINT "registros_ingresos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ingresos" ADD CONSTRAINT "registros_ingresos_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ingresos" ADD CONSTRAINT "registros_ingresos_unidad_destino_id_fkey" FOREIGN KEY ("unidad_destino_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ingresos" ADD CONSTRAINT "registros_ingresos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores_departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ingresos" ADD CONSTRAINT "registros_ingresos_operador_ingreso_id_fkey" FOREIGN KEY ("operador_ingreso_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ingresos" ADD CONSTRAINT "registros_ingresos_operador_egreso_id_fkey" FOREIGN KEY ("operador_egreso_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_visitas" ADD CONSTRAINT "detalles_visitas_ingreso_id_fkey" FOREIGN KEY ("ingreso_id") REFERENCES "registros_ingresos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
