"use strict";
//Router for property-related endpoints.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Provides routes for retrieving, creating, and managing property
//data. Includes authorization checks, file upload handling using multer memory
//storage, and controller bindings for property operations.
//React framework imports
const express_1 = __importDefault(require("express"));
//Third-party libraries
const multer_1 = __importDefault(require("multer"));
//Project modules (lib, utils, state, constants)
const authorizationMiddleware_1 = require("../middleware/authorizationMiddleware");
//UI components
//Local components
const propertyControllers_1 = require("../controllers/propertyControllers");
//Types
//Multer configuration using in-memory storage for temporary photo handling.
//This allows the controller to process images without writing files to disk.
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
//Express router instance for property routes.
const router = express_1.default.Router();
//Retrieves a list of all properties.
//Useful for displaying property listings or performing searches.
router.get('/', propertyControllers_1.getProperties);
//Retrieves details for a single property identified by its ID.
router.get('/:id', propertyControllers_1.getProperty);
//Creates a new property. Requires manager authorization.
//Uploads multiple photos via multipart form-data using memory storage.
router.post('/', (0, authorizationMiddleware_1.authMiddleware)(['manager']), upload.array('photos'), propertyControllers_1.createProperty);
exports.default = router;
