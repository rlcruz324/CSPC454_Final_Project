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
const authorizationMiddleware_1 = require("../middleware/authorizationMiddleware");
// Local components
const leaseControllers_1 = require("../controllers/leaseControllers");
// Express router instance for lease-related routes.
const router = express_1.default.Router();
// Retrieves all leases accessible by authorized managers or tenants.
// Useful for displaying lease summaries or dashboards.
router.get('/', (0, authorizationMiddleware_1.authMiddleware)(['manager', 'tenant']), leaseControllers_1.getLeases);
// Retrieves payment history for a specific lease based on its ID.
// Authorization ensures only allowed roles can view payment details.
router.get('/:id/payments', (0, authorizationMiddleware_1.authMiddleware)(['manager', 'tenant']), leaseControllers_1.getLeasePayments);
exports.default = router;
