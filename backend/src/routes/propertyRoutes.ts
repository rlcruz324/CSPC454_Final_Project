//Router for property-related endpoints.

//Provides routes for retrieving, creating, and managing property
//data. Includes authorization checks, file upload handling using multer memory
//storage, and controller bindings for property operations.

//React framework imports
import express from 'express';

//Third-party libraries
import multer from 'multer';

//Project modules (lib, utils, state, constants)
import { authMiddleware } from '../middleware/authorizationMiddleware';

//UI components

//Local components
import {
  getProperties,
  getProperty,
  createProperty,
} from '../controllers/propertyControllers';

//Types

//Multer configuration using in-memory storage for temporary photo handling.
//This allows the controller to process images without writing files to disk.
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Express router instance for property routes.
const router = express.Router();

//Retrieves a list of all properties.
//Useful for displaying property listings or performing searches.
router.get('/', getProperties);

//Retrieves details for a single property identified by its ID.
router.get('/:id', getProperty);

//Creates a new property. Requires manager authorization.
//Uploads multiple photos via multipart form-data using memory storage.
router.post(
  '/',
  authMiddleware(['manager']),
  upload.array('photos'),
  createProperty
);

export default router;
