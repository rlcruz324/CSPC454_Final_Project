"use strict";
//Manager controller for retrieving, creating, updating, and listing manager properties.
//Provides endpoints for manager lookup, manager creation, manager updates, and
//retrieval of all properties managed by a specific manager. Enhances property data with geographic
//coordinate conversion, integrates Prisma ORM operations, and returns structured JSON responses.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagerProperties = exports.updateManager = exports.createManager = exports.getManager = void 0;
const client_1 = require("@prisma/client");
const wkt_1 = require("@terraformer/wkt");
//Prisma client instance for database access throughout the controller.
const prisma = new client_1.PrismaClient();
//Retrieves a single manager by Cognito ID. Used for displaying or validating manager profile data.
const getManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const manager = yield prisma.manager.findUnique({
            where: { cognitoId },
        });
        if (manager) {
            res.json(manager);
        }
        else {
            res.status(404).json({ message: 'Manager not found' });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving manager: ${error.message}` });
    }
});
exports.getManager = getManager;
//Creates a new manager record using basic profile fields.
//Typically run during first-time authentication or onboarding.
const createManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const manager = yield prisma.manager.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber,
            },
        });
        res.status(201).json(manager);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating manager: ${error.message}` });
    }
});
exports.createManager = createManager;
//Updates manager information. Supports editing of name, email, or phone number.
const updateManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const { name, email, phoneNumber } = req.body;
        const updateManager = yield prisma.manager.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber,
            },
        });
        res.json(updateManager);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error updating manager: ${error.message}` });
    }
});
exports.updateManager = updateManager;
//Retrieves all properties belonging to a manager and converts their spatial WKT
//coordinates to standard longitude/latitude for frontend use.
const getManagerProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const properties = yield prisma.property.findMany({
            where: { managerCognitoId: cognitoId },
            include: {
                location: true,
            },
        });
        const propertiesWithFormattedLocation = yield Promise.all(properties.map((property) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const coordinates = yield prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
            const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || '');
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            return Object.assign(Object.assign({}, property), { location: Object.assign(Object.assign({}, property.location), { coordinates: {
                        longitude,
                        latitude,
                    } }) });
        })));
        res.json(propertiesWithFormattedLocation);
    }
    catch (err) {
        res
            .status(500)
            .json({
            message: `Error retrieving manager properties: ${err.message}`,
        });
    }
});
exports.getManagerProperties = getManagerProperties;
