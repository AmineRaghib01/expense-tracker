import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/insights', aiController.getInsights);
router.post('/insights/generate', aiController.generateInsights);
router.get('/spending-analysis', aiController.getSpendingAnalysis);
router.get('/financial-health', aiController.getFinancialHealth);
router.get('/forecast', aiController.getForecast);

export default router;
