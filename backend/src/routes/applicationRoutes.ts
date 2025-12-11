//Router for application creation, listing, and status updates.
//Defines application-related API routes including creating new
//applications, updating application status, and retrieving filtered application
//lists. Applies role-based authorization for tenants and managers.

//React framework imports
import express from 'express';

//Third-party libraries

//Project modules (lib, utils, state, constants)
import { requireRole } from '../middleware/requireRolesMiddleware';

//UI components

//Local components
import {
  createApplication,
  listApplications,
  updateApplicationStatus,
} from '../controllers/applicationControllers';

//Types

//Router instance for application-related routes.
const router = express.Router();

//Creates a new rental application. Restricted to tenant role to prevent
//unauthorized submissions.
router.post('/', requireRole(['tenant']), createApplication);

//Updates the status of an existing application. Restricted to managers to
//maintain administrative control over approvals and denials.
router.put('/:id/status', requireRole(['manager']), updateApplicationStatus);

//Retrieves applications with optional filtering based on user role and identity.
//Accessible to both managers and tenants.
router.get('/', requireRole(['manager', 'tenant']), listApplications);

export default router;
