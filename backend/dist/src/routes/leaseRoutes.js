"use strict";
// Short summary: Router for lease and lease payment endpoints.
// Detailed summary: Defines routes for retrieving all leases and payments for a
// specific lease. Applies authorization rules for managers and tenants, and
// forwards requests to the appropriate controller handlers.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// React / framework imports
const express_1 = __importDefault(require("express"));
// Project modules (lib, utils, state, constants)
const requireRolesMiddleware_1 = require("../middleware/requireRolesMiddleware");
// Local components
const leasePaymentControllers_1 = require("../controllers/leasePaymentControllers");
// Express router instance for lease-related routes.
const router = express_1.default.Router();
// Retrieves all leases accessible by authorized managers or tenants.
// Useful for displaying lease summaries or dashboards.
router.get('/', (0, requireRolesMiddleware_1.requireRole)(['manager', 'tenant']), leasePaymentControllers_1.listLeases);
// Retrieves payment history for a specific lease based on its ID.
// Authorization ensures only allowed roles can view payment details.
router.get('/:id/payments', (0, requireRolesMiddleware_1.requireRole)(['manager', 'tenant']), leasePaymentControllers_1.listLeasePayments);
exports.default = router;
