"use strict";
//problematic code potentially the reason why the image upload to s3 bucket is always broken
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//router for property-related endpoints.
//routes for retrieving, creating, and managing property
//data. Includes authorization checks, file upload handling using multer memory
//storage, and controller bindings for property operations.
//imports
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const requireRolesMiddleware_1 = require("../middleware/requireRolesMiddleware");
const propertyManagementControllers_1 = require("../controllers/propertyManagementControllers");
//multer configuration using in-memory storage for temporary photo handling.
//this allows the controller to process images without writing files to disk.
//could be why the s3 bucket keeps getting junk in it instead of the actual file
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
//express router instance for property routes.
const router = express_1.default.Router();
//retrieves a list of all properties.
//useful for displaying property listings or performing searches.
router.get('/', propertyManagementControllers_1.listProperties);
//retrieves details for a single property identified by its ID.
router.get('/:id', propertyManagementControllers_1.fetchPropertyByID);
//creates a new property. Requires manager authorization.
//uploads multiple photos via multipart form-data using memory storage.
//could also be the reason for the s3 bucket issue maybe
router.post('/', (0, requireRolesMiddleware_1.requireRole)(['manager']), upload.array('photos'), propertyManagementControllers_1.addProperty);
exports.default = router;
