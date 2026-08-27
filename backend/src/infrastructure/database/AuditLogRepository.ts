import prisma from './prisma';
import { IAuditLogRepository } from '@/domain/interfaces';

export class AuditLogRepository implements IAuditLogRepository {
  async create(data: any) {
    return await prisma.auditLog.create({ data });
  }

  async findRecent(limit: number) {
    return await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
