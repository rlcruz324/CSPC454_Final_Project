"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenantServiceControllers_1 = require("../controllers/tenantServiceControllers");
const router = express_1.default.Router();
router.get("/:cognitoId", tenantServiceControllers_1.fetchTenant);
router.put("/:cognitoId", tenantServiceControllers_1.fetchTenantInfo);
router.post("/", tenantServiceControllers_1.addTenant);
router.get("/:cognitoId/current-residences", tenantServiceControllers_1.fetchTenantResidences);
router.post("/:cognitoId/favorites/:propertyId", tenantServiceControllers_1.addTenantFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId", tenantServiceControllers_1.removeTenantFavoriteProperty);
exports.default = router;
