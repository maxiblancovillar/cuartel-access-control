import { Router } from 'express';
import 'express-async-errors';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { AuthController } from '../controllers/AuthController';
import { AccessController } from '../controllers/AccessController';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();

// Controllers
const authController = new AuthController();
const accessController = new AccessController();
const dashboardController = new DashboardController();

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

// ==================== DASHBOARD ====================
router.get(
  '/dashboard/situacion-actual',
  authMiddleware,
  roleGuard('SUPERVISOR', 'ADMIN'),
  (req, res, next) => dashboardController.situacionActual(req, res).catch(next)
);

export default router;
