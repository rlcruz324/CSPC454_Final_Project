// Short summary: Router for lease and lease payment endpoints.
// Detailed summary: Defines routes for retrieving all leases and payments for a
// specific lease. Applies authorization rules for managers and tenants, and
// forwards requests to the appropriate controller handlers.

// React / framework imports
import express from 'express';

// Project modules (lib, utils, state, constants)
import { authMiddleware } from '../middleware/authorizationMiddleware';

// Local components
import { getLeasePayments, getLeases } from '../controllers/leaseControllers';

// Express router instance for lease-related routes.
const router = express.Router();

// Retrieves all leases accessible by authorized managers or tenants.
// Useful for displaying lease summaries or dashboards.
router.get('/', authMiddleware(['manager', 'tenant']), getLeases);
// Retrieves payment history for a specific lease based on its ID.
// Authorization ensures only allowed roles can view payment details.
router.get(
  '/:id/payments',
  authMiddleware(['manager', 'tenant']),
  getLeasePayments
);

export default router;
