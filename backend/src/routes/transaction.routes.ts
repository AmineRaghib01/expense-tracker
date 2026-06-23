import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../validators/finance.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(transactionQuerySchema, 'query'), transactionController.getAll);
router.get('/:id', transactionController.getById);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.put('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;
