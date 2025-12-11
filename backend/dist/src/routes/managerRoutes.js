"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const managerServiceControllers_1 = require("../controllers/managerServiceControllers");
const router = express_1.default.Router();
router.get("/:cognitoId", managerServiceControllers_1.fetchManger);
router.put("/:cognitoId", managerServiceControllers_1.editManager);
router.get("/:cognitoId/properties", managerServiceControllers_1.fetchManagerProperties);
router.post("/", managerServiceControllers_1.addManager);
exports.default = router;
