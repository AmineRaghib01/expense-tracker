import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { dashboardQuerySchema } from '../validators/finance.validator.js';

const router = Router();

router.use(authenticate);
router.get('/', validate(dashboardQuerySchema, 'query'), dashboardController.getDashboard);

export default router;
