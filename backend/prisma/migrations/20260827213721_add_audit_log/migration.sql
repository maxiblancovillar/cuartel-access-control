-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "usuario_username" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "recurso" VARCHAR(100) NOT NULL,
    "exitoso" BOOLEAN NOT NULL DEFAULT true,
    "detalle" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_usuario_id_idx" ON "audit_logs"("usuario_id");
