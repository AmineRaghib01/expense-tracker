import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBudgetSchema, updateBudgetSchema } from '../validators/finance.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getById);
router.post('/', validate(createBudgetSchema), budgetController.create);
router.put('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;
