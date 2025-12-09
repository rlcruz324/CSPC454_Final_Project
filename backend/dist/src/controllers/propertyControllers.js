"use strict";
//Property controller providing retrieval, filtering, and creation logic.
//Handles complex property queries with dynamic filters, retrieves individual
//properties with geographic data, and creates new property records with S3 photo uploads,
//geocoding, location creation, and database persistence via Prisma ORM. Includes spatial
//processing, external API calls, and structured responses.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = exports.getProperty = exports.getProperties = void 0;
const client_1 = require("@prisma/client");
const wkt_1 = require("@terraformer/wkt");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const axios_1 = __importDefault(require("axios"));
//Prisma client instance for database access.
const prisma = new client_1.PrismaClient();
//AWS S3 client configuration for uploading property photos.
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
});
//Retrieves multiple properties with dynamic filtering based on query parameters.
//Builds a raw SQL query using Prisma.sql, allowing expressive conditions and spatial operations.
const getProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { favoriteIds, priceMin, priceMax, beds, baths, propertyType, squareFeetMin, squareFeetMax, amenities, availableFrom, latitude, longitude, } = req.query;
        let whereConditions = [];
        //Filters properties by favorite IDs.
        if (favoriteIds) {
            const favoriteIdsArray = favoriteIds.split(',').map(Number);
            whereConditions.push(client_1.Prisma.sql `p.id IN (${client_1.Prisma.join(favoriteIdsArray)})`);
        }
        //Price range filters.
        if (priceMin) {
            whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" >= ${Number(priceMin)}`);
        }
        if (priceMax) {
            whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" <= ${Number(priceMax)}`);
        }
        //Bedroom and bathroom filters.
        if (beds && beds !== 'any') {
            whereConditions.push(client_1.Prisma.sql `p.beds >= ${Number(beds)}`);
        }
        if (baths && baths !== 'any') {
            whereConditions.push(client_1.Prisma.sql `p.baths >= ${Number(baths)}`);
        }
        // Square footage filters.
        if (squareFeetMin) {
            whereConditions.push(client_1.Prisma.sql `p."squareFeet" >= ${Number(squareFeetMin)}`);
        }
        if (squareFeetMax) {
            whereConditions.push(client_1.Prisma.sql `p."squareFeet" <= ${Number(squareFeetMax)}`);
        }
        //Property type filter (enum).
        if (propertyType && propertyType !== 'any') {
            whereConditions.push(client_1.Prisma.sql `p."propertyType" = ${propertyType}::"PropertyType"`);
        }
        //Amenities array filter using PostgreSQL array containment.
        if (amenities && amenities !== 'any') {
            const amenitiesArray = amenities.split(',');
            whereConditions.push(client_1.Prisma.sql `p.amenities @> ${amenitiesArray}`);
        }
        //Ensures a property is available before a given date.
        if (availableFrom && availableFrom !== 'any') {
            const availableFromDate = typeof availableFrom === 'string' ? availableFrom : null;
            if (availableFromDate) {
                const date = new Date(availableFromDate);
                if (!isNaN(date.getTime())) {
                    whereConditions.push(client_1.Prisma.sql `EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" <= ${date.toISOString()}
            )`);
                }
            }
        }
        //Spatial radius filter using ST_DWithin.
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const radiusInKilometers = 1000;
            const degrees = radiusInKilometers / 111;
            whereConditions.push(client_1.Prisma.sql `ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`);
        }
        //Complete SQL query assembling conditions and joining location data.
        const completeQuery = client_1.Prisma.sql `
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereConditions.length > 0
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, ' AND ')}`
            : client_1.Prisma.empty}
    `;
        const properties = yield prisma.$queryRaw(completeQuery);
        res.json(properties);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving properties: ${error.message}` });
    }
});
exports.getProperties = getProperties;
//Retrieves a single property with its resolved geographic coordinates.
//Converts WKT geometry from the database into standard longitude/latitude format.
const getProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const property = yield prisma.property.findUnique({
            where: { id: Number(id) },
            include: {
                location: true,
            },
        });
        if (property) {
            const coordinates = yield prisma.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
            const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || '');
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            const propertyWithCoordinates = Object.assign(Object.assign({}, property), { location: Object.assign(Object.assign({}, property.location), { coordinates: {
                        longitude,
                        latitude,
                    } }) });
            res.json(propertyWithCoordinates);
        }
    }
    catch (err) {
        res
            .status(500)
            .json({ message: `Error retrieving property: ${err.message}` });
    }
});
exports.getProperty = getProperty;
const streamToBuffer = require('stream-to-buffer');
const createProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const files = req.files;
        const _c = req.body, { address, city, state, country, postalCode, managerCognitoId } = _c, propertyData = __rest(_c, ["address", "city", "state", "country", "postalCode", "managerCognitoId"]);
        console.log('Received property creation request:', { address, city, state, country, postalCode, managerCognitoId, propertyData });
        // Upload photos
        const photoUrls = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const uploadParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `properties/${Date.now()}-${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            console.log('Uploading file to S3:', uploadParams.Key);
            const uploadResult = yield new lib_storage_1.Upload({ client: s3Client, params: uploadParams }).done();
            console.log('Uploaded file to S3:', uploadResult);
            return uploadResult.Location;
        })));
        console.log('All photos uploaded:', photoUrls);
        // Geocoding
        const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
            street: address,
            city,
            country,
            postalcode: postalCode,
            format: 'json',
            limit: '1',
        }).toString()}`;
        console.log('Calling geocoding API:', geocodingUrl);
        const geocodingResponse = yield axios_1.default.get(geocodingUrl, {
            headers: { 'User-Agent': 'RealEstateApp (justsomedummyemail@gmail.com)' },
        });
        console.log('Geocoding response:', geocodingResponse.data);
        const [longitude, latitude] = ((_a = geocodingResponse.data[0]) === null || _a === void 0 ? void 0 : _a.lon) && ((_b = geocodingResponse.data[0]) === null || _b === void 0 ? void 0 : _b.lat)
            ? [parseFloat(geocodingResponse.data[0].lon), parseFloat(geocodingResponse.data[0].lat)]
            : [0, 0];
        console.log('Geocoded coordinates:', { longitude, latitude });
        // Insert location
        const [location] = yield prisma.$queryRaw `
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;
        console.log('Inserted location:', location);
        // Create property
        const newProperty = yield prisma.property.create({
            data: Object.assign(Object.assign({}, propertyData), { photoUrls, locationId: location.id, managerCognitoId, amenities: typeof propertyData.amenities === 'string' ? propertyData.amenities.split(',') : [], highlights: typeof propertyData.highlights === 'string' ? propertyData.highlights.split(',') : [], isPetsAllowed: propertyData.isPetsAllowed === 'true', isParkingIncluded: propertyData.isParkingIncluded === 'true', pricePerMonth: parseFloat(propertyData.pricePerMonth), securityDeposit: parseFloat(propertyData.securityDeposit), applicationFee: parseFloat(propertyData.applicationFee), beds: parseInt(propertyData.beds), baths: parseFloat(propertyData.baths), squareFeet: parseInt(propertyData.squareFeet) }),
            include: { location: true, manager: true },
        });
        console.log('Property created successfully:', newProperty);
        res.status(201).json(newProperty);
    }
    catch (err) {
        console.error('Error creating property:', err); // <- log full error stack
        res.status(500).json({ message: `Error creating property: ${err.message}` });
    }
});
exports.createProperty = createProperty;
//Creates a property, uploads photos to S3, performs geocoding, inserts a location,
//and saves final property data to the database. Handles array parsing, numeric
//conversions, and spatial data creation.
// export const createProperty = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const files = req.files as Express.Multer.File[];
//     const {
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       managerCognitoId,
//       ...propertyData
//     } = req.body;
//     //Uploads each photo to S3 and collects their URLs.
//     const photoUrls = await Promise.all(
//       files.map(async (file) => {
//         const uploadParams = {
//           Bucket: process.env.S3_BUCKET_NAME!,
//           Key: `properties/${Date.now()}-${file.originalname}`,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//         };
//         const uploadResult = await new Upload({
//           client: s3Client,
//           params: uploadParams,
//         }).done();
//         return uploadResult.Location;
//       })
//     );
//     //Performs geocoding using OpenStreetMap Nominatim API.
//     const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
//       {
//         street: address,
//         city,
//         country,
//         postalcode: postalCode,
//         format: 'json',
//         limit: '1',
//       }
//     ).toString()}`;
//     const geocodingResponse = await axios.get(geocodingUrl, {
//       headers: {
//         'User-Agent': 'RealEstateApp (justsomedummyemail@gmail.com',
//       },
//     });
//     const [longitude, latitude] =
//       geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
//         ? [
//             parseFloat(geocodingResponse.data[0]?.lon),
//             parseFloat(geocodingResponse.data[0]?.lat),
//           ]
//         : [0, 0];
//     //Inserts location record with geometry based on geocoded coordinates.
//     const [location] = await prisma.$queryRaw<Location[]>`
//       INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
//       VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
//       RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
//     `;
//     //Creates the property entry with parsed fields and relationships.
//     const newProperty = await prisma.property.create({
//       data: {
//         ...propertyData,
//         photoUrls,
//         locationId: location.id,
//         managerCognitoId,
//         amenities:
//           typeof propertyData.amenities === 'string'
//             ? propertyData.amenities.split(',')
//             : [],
//         highlights:
//           typeof propertyData.highlights === 'string'
//             ? propertyData.highlights.split(',')
//             : [],
//         isPetsAllowed: propertyData.isPetsAllowed === 'true',
//         isParkingIncluded: propertyData.isParkingIncluded === 'true',
//         pricePerMonth: parseFloat(propertyData.pricePerMonth),
//         securityDeposit: parseFloat(propertyData.securityDeposit),
//         applicationFee: parseFloat(propertyData.applicationFee),
//         beds: parseInt(propertyData.beds),
//         baths: parseFloat(propertyData.baths),
//         squareFeet: parseInt(propertyData.squareFeet),
//       },
//       include: {
//         location: true,
//         manager: true,
//       },
//     });
//     res.status(201).json(newProperty);
//   } catch (err: any) {
//     res
//       .status(500)
//       .json({ message: `Error creating property: ${err.message}` });
//   }
// };
