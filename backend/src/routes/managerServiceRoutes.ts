import express from "express";
import {
  fetchManger,
  addManager,
  editManager,
  fetchManagerProperties,
} from '../controllers/managerServiceControllers';

const router = express.Router();

router.get("/:cognitoId", fetchManger);
router.put("/:cognitoId", editManager);
router.get("/:cognitoId/properties", fetchManagerProperties);
router.post("/", addManager);

export default router;