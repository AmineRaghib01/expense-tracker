import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { reportQuerySchema } from '../validators/finance.validator.js';

const router = Router();

router.use(authenticate);
router.get('/', validate(reportQuerySchema, 'query'), reportController.generate);

export default router;
