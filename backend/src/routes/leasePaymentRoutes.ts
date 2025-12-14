//router for lease and lease payment endpoints
//defines routes for retrieving all leases and payments for a
//specific lease. Applies authorization rules for managers and tenants and
//forwards requests to the appropriate controller handlers

import express from 'express';
import { requireRole } from '../middleware/requireRolesMiddleware';

import { listLeasePayments, listLeases } from '../controllers/leasePaymentControllers';

//express router instance for lease-related routes.
const router = express.Router();

//retrieves all leases accessible by authorized managers or tenants.
// useful for displaying lease summaries or dashboards.
router.get('/', requireRole(['manager', 'tenant']), listLeases);
//retrieves payment history for a specific lease based on its ID.
//authorization ensures only allowed roles can view payment details.
router.get(
  '/:id/payments',
  requireRole(['manager', 'tenant']),
  listLeasePayments
);

export default router;
