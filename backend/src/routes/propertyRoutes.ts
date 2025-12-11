//problematic code potentially the reason why the image upload to s3 bucket is always broken

//router for property-related endpoints.

//routes for retrieving, creating, and managing property
//data. Includes authorization checks, file upload handling using multer memory
//storage, and controller bindings for property operations.

//imports
import express from 'express';
import multer from 'multer';
import { requireRole } from '../middleware/requireRolesMiddleware';


import {
  getProperties,
  getProperty,
  createProperty,
} from '../controllers/propertyControllers';


//multer configuration using in-memory storage for temporary photo handling.
//this allows the controller to process images without writing files to disk.
//could be why the s3 bucket keeps getting junk in it instead of the actual file
const storage = multer.memoryStorage();
const upload = multer({ storage });

//express router instance for property routes.
const router = express.Router();

//retrieves a list of all properties.
//useful for displaying property listings or performing searches.
router.get('/', getProperties);

//retrieves details for a single property identified by its ID.
router.get('/:id', getProperty);

//creates a new property. Requires manager authorization.
//uploads multiple photos via multipart form-data using memory storage.
//could also be the reason for the s3 bucket issue maybe
router.post(
  '/',
  requireRole(['manager']),
  upload.array('photos'),
  createProperty
);

export default router;
