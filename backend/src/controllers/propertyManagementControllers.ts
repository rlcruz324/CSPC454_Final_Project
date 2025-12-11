//Property controller providing retrieval, filtering, and creation logic.
//Handles complex property queries with dynamic filters, retrieves individual
//properties with geographic data, and creates new property records with S3 photo uploads,
//geocoding, location creation, and database persistence via Prisma ORM. Includes spatial
//processing, external API calls, and structured responses.

//React framework imports

//Third-party libraries
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { wktToGeoJSON } from '@terraformer/wkt';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import axios from 'axios';

//project modules (lib, utils, state, constants)
import { Location } from '@prisma/client';

//prisma client instance for database access.
const prisma = new PrismaClient();

//AWS S3 client configuration for uploading property photos.
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

//retrieves multiple properties with dynamic filtering based on query parameters.
//builds a raw SQL query using Prisma.sql, allowing expressive conditions and spatial operations.
export const listProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    //Filters properties by favorite IDs.
    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(',').map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    //Price range filters.
    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
      );
    }

    //Bedroom and bathroom filters.
    if (beds && beds !== 'any') {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== 'any') {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    // Square footage filters.
    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
      );
    }

    //Property type filter (enum).
    if (propertyType && propertyType !== 'any') {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    //Amenities array filter using PostgreSQL array containment.
    if (amenities && amenities !== 'any') {
      const amenitiesArray = (amenities as string).split(',');
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    //Ensures a property is available before a given date.
    if (availableFrom && availableFrom !== 'any') {
      const availableFromDate =
        typeof availableFrom === 'string' ? availableFrom : null;
      if (availableFromDate) {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" <= ${date.toISOString()}
            )`
          );
        }
      }
    }

    //Spatial radius filter using ST_DWithin.
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKilometers = 1000;
      const degrees = radiusInKilometers / 111;

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`
      );
    }

    //Complete SQL query assembling conditions and joining location data.
    const completeQuery = Prisma.sql`
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
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
          : Prisma.empty
      }
    `;

    const properties = await prisma.$queryRaw(completeQuery);

    res.json(properties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};

//Retrieves a single property with its resolved geographic coordinates.
//Converts WKT geometry from the database into standard longitude/latitude format.
export const fetchPropertyByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || '');
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };

      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};


//Creates a property, uploads photos to S3, performs geocoding, inserts a location,
//and saves final property data to the database. 
//Handles array parsing, numeric
//conversions, and spatial data creation.
//this code is a probelm because when it uploads the images to the s3 bucket it gives it a broken image
//but why?
export const addProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { address, city, state, country, postalCode, managerCognitoId, ...propertyData } = req.body;

    console.log('Received property creation request:', { address, city, state, country, postalCode, managerCognitoId, propertyData });

    // Upload photos
    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        console.log('Uploading file to S3:', uploadParams.Key);

        const uploadResult = await new Upload({ client: s3Client, params: uploadParams }).done();
        console.log('Uploaded file to S3:', uploadResult);

        return uploadResult.Location;
      })
    );

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

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: { 'User-Agent': 'RealEstateApp (justsomedummyemail@gmail.com)' },
    });

    console.log('Geocoding response:', geocodingResponse.data);

    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [parseFloat(geocodingResponse.data[0].lon), parseFloat(geocodingResponse.data[0].lat)]
        : [0, 0];

    console.log('Geocoded coordinates:', { longitude, latitude });

    // Insert location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    console.log('Inserted location:', location);

    // Create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities: typeof propertyData.amenities === 'string' ? propertyData.amenities.split(',') : [],
        highlights: typeof propertyData.highlights === 'string' ? propertyData.highlights.split(',') : [],
        isPetsAllowed: propertyData.isPetsAllowed === 'true',
        isParkingIncluded: propertyData.isParkingIncluded === 'true',
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: { location: true, manager: true },
    });

    console.log('Property created successfully:', newProperty);
    res.status(201).json(newProperty);
  } catch (err: any) {
    console.error('Error creating property:', err); // <- log full error stack
    res.status(500).json({ message: `Error creating property: ${err.message}` });
  }
};


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
