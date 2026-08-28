import { Router } from 'express';
import 'express-async-errors';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { AuthController } from '../controllers/AuthController';
import { AccessController } from '../controllers/AccessController';
import { DashboardController } from '../controllers/DashboardController';
import { UnitsController } from '../controllers/UnitsController';
import { ReportsController } from '../controllers/ReportsController';
import { AdminController } from '../controllers/AdminController';

const router = Router();

// Controllers
const authController = new AuthController();
const accessController = new AccessController();
const dashboardController = new DashboardController();
const unitsController = new UnitsController();
const reportsController = new ReportsController();
const adminController = new AdminController();

// ==================== AUTH ====================
router.post('/auth/login', (req, res, next) => authController.login(req, res).catch(next));
router.post('/auth/logout', authMiddleware, (req, res, next) =>
  Promise.resolve(authController.logout(req, res)).catch(next)
);

// ==================== ACCESS ====================
router.get('/access/lookup/:dni', authMiddleware, roleGuard('OPERADOR'), (req, res, next) =>
  accessController.lookup(req, res).catch(next)
);

router.post(
  '/access/check-in/presente',
  authMiddleware,
  roleGuard('OPERADOR'),
  (req, res, next) => accessController.checkInPresente(req, res).catch(next)
);

router.post(
  '/access/check-in/visita',
  authMiddleware,
  roleGuard('OPERADOR'),
  (req, res, next) => accessController.checkInVisita(req, res).catch(next)
);

router.patch(
  '/access/check-out/:ingresoId',
  authMiddleware,
  roleGuard('OPERADOR'),
  (req, res, next) => accessController.checkOut(req, res).catch(next)
);

// ==================== UNITS ====================
router.get(
  '/units/tree',
  authMiddleware,
  roleGuard('OPERADOR', 'SUPERVISOR', 'ADMIN'),
  (req, res, next) => unitsController.tree(req, res).catch(next)
);

// ==================== DASHBOARD ====================
router.get(
  '/dashboard/situacion-actual',
  authMiddleware,
  roleGuard('SUPERVISOR', 'ADMIN'),
  (req, res, next) => dashboardController.situacionActual(req, res).catch(next)
);

// ==================== REPORTS ====================
router.get(
  '/reports/registros',
  authMiddleware,
  roleGuard('SUPERVISOR', 'ADMIN'),
  (req, res, next) => reportsController.getRegistros(req, res).catch(next)
);

router.get('/reports/stats', authMiddleware, roleGuard('SUPERVISOR', 'ADMIN'), (req, res, next) =>
  reportsController.getStats(req, res).catch(next)
);

// ==================== ADMIN ====================
router.get('/admin/usuarios', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.getUsuarios(req, res).catch(next)
);

router.post('/admin/usuarios', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.createUsuario(req, res).catch(next)
);

router.put('/admin/usuarios/:id', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.updateUsuario(req, res).catch(next)
);

router.delete('/admin/usuarios/:id', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.deactivateUsuario(req, res).catch(next)
);

router.get('/admin/unidades', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.getUnidades(req, res).catch(next)
);

router.get('/admin/unidades/tree', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.getUnidadesTree(req, res).catch(next)
);

router.post('/admin/unidades', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.createUnidad(req, res).catch(next)
);

router.put('/admin/unidades/:id', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.updateUnidad(req, res).catch(next)
);

router.get('/admin/audit-logs', authMiddleware, roleGuard('ADMIN'), (req, res, next) =>
  adminController.getAuditLogs(req, res).catch(next)
);

export default router;
