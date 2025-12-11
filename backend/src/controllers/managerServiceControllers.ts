//Manager controller for retrieving, creating, updating, and listing manager properties.
//Provides endpoints for manager lookup, manager creation, manager updates, and
//retrieval of all properties managed by a specific manager. Enhances property data with geographic
//coordinate conversion, integrates Prisma ORM operations, and returns structured JSON responses.


import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { wktToGeoJSON } from '@terraformer/wkt';


//Prisma client instance for database access throughout the controller.
const prisma = new PrismaClient();

//Retrieves a single manager by Cognito ID. Used for displaying or validating manager profile data.
export const fetchManger = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: 'Manager not found' });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager: ${error.message}` });
  }
};

//Creates a new manager record using basic profile fields.
//Typically run during first-time authentication or onboarding.
export const addManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating manager: ${error.message}` });
  }
};

//Updates manager information. Supports editing of name, email, or phone number.
export const editManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateManager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating manager: ${error.message}` });
  }
};

//Retrieves all properties belonging to a manager and converts their spatial WKT
//coordinates to standard longitude/latitude for frontend use.
export const fetchManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;

    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
      include: {
        location: true,
      },
    });

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || '');
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      })
    );

    res.json(propertiesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({
        message: `Error retrieving manager properties: ${err.message}`,
      });
  }
};
