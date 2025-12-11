"use strict";
//Router for application creation, listing, and status updates.
//Defines application-related API routes including creating new
//applications, updating application status, and retrieving filtered application
//lists. Applies role-based authorization for tenants and managers.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//React framework imports
const express_1 = __importDefault(require("express"));
//Third-party libraries
//Project modules (lib, utils, state, constants)
const requireRolesMiddleware_1 = require("../middleware/requireRolesMiddleware");
//UI components
//Local components
const rentalApplicationControllers_1 = require("../controllers/rentalApplicationControllers");
//Types
//Router instance for application-related routes.
const router = express_1.default.Router();
//Creates a new rental application. Restricted to tenant role to prevent
//unauthorized submissions.
router.post('/', (0, requireRolesMiddleware_1.requireRole)(['tenant']), rentalApplicationControllers_1.addApplication);
//Updates the status of an existing application. Restricted to managers to
//maintain administrative control over approvals and denials.
router.put('/:id/status', (0, requireRolesMiddleware_1.requireRole)(['manager']), rentalApplicationControllers_1.setApplicationStatus);
//Retrieves applications with optional filtering based on user role and identity.
//Accessible to both managers and tenants.
router.get('/', (0, requireRolesMiddleware_1.requireRole)(['manager', 'tenant']), rentalApplicationControllers_1.getApplications);
exports.default = router;
