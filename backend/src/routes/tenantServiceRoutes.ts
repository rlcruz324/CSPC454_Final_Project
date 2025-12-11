import express from "express";
import {
  fetchTenant,
  addTenant,
  fetchTenantInfo,
  fetchTenantResidences,
  addTenantFavoriteProperty,
  removeTenantFavoriteProperty,
} from "../controllers/tenantServiceControllers";

const router = express.Router();

router.get("/:cognitoId", fetchTenant);
router.put("/:cognitoId", fetchTenantInfo);
router.post("/", addTenant);
router.get("/:cognitoId/current-residences", fetchTenantResidences);
router.post("/:cognitoId/favorites/:propertyId", addTenantFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId", removeTenantFavoriteProperty);

export default router;