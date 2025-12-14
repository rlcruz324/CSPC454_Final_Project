//Router for application creation, listing, and status updates
//Defines application-related API routes including creating new
//applications, updating application status, and retrieving filtered application
//lists Applies role-based authorization for tenants and managers

//react framework imports
import express from 'express';

//third-party libraries

//project modules (lib, utils, state, constants)
import { requireRole } from '../middleware/requireRolesMiddleware';

//UI components

//local components
import {
  addApplication,
  getApplications,
  setApplicationStatus,
} from '../controllers/rentalApplicationControllers';

//types

//router instance for application-related routes
const router = express.Router();

//creates a new rental application. Restricted to tenant role to prevent
//unauthorized submissions.
router.post('/', requireRole(['tenant']), addApplication);

//updates the status of an existing application. Restricted to managers to
//maintain administrative control over approvals and denials
router.put('/:id/status', requireRole(['manager']), setApplicationStatus);

//retrieves applications with optional filtering based on user role and identity
//accessible to both managers and tenants
router.get('/', requireRole(['manager', 'tenant']), getApplications);

export default router;
