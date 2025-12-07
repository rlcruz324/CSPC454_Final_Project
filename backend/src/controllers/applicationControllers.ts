//Handlers for application CRUD operations and related lease logic.
//Manages listing, creating, and updating rental applications.
//Includes conditional filtering for user roles, formatting property data, lease
//creation within transactions, payment date computation, and status-driven logic
//for approvals, denials, and tenant-property associations.

//React framework imports
import { Request, Response } from 'express';


//Project modules (lib, utils, state, constants)
import { PrismaClient } from '@prisma/client';

//Prisma client instance for database access.
const prisma = new PrismaClient();

//Lists applications based on optional tenant or manager context.
//When userId and userType are present, results are filtered accordingly.
export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    // Dynamic filtering based on user identity and role.
    let whereClause: any = {};
    if (userId && userType) {
      if (userType === 'tenant') {
        whereClause = { tenantCognitoId: String(userId) };
      } else if (userType === 'manager') {
        whereClause = {
          property: {
            managerCognitoId: String(userId),
          },
        };
      }
    }

    //Fetch applications with related property, tenant, and location data.
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            location: true,
            manager: true,
          },
        },
        tenant: true,
      },
    });

    //Calculates the next payment date based on the lease start date.
    function calculateNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      return nextPaymentDate;
    }

    //Enhances each application with formatted address and lease details.
    const formattedApplications = await Promise.all(
      applications.map(async (app) => {
        const lease = await prisma.lease.findFirst({
          where: {
            tenant: { cognitoId: app.tenantCognitoId },
            propertyId: app.propertyId,
          },
          orderBy: { startDate: 'desc' },
        });

        return {
          ...app,
          property: {
            ...app.property,
            address: app.property.location.address,
          },
          manager: app.property.manager,
          lease: lease
            ? {
                ...lease,
                nextPaymentDate: calculateNextPaymentDate(lease.startDate),
              }
            : null,
        };
      })
    );

    res.json(formattedApplications);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving applications: ${error.message}` });
  }
};

//Creates a new application along with an associated lease inside a transaction.
//Ensures consistent linking of tenant, property, and lease data.
export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      applicationDate,
      status,
      propertyId,
      tenantCognitoId,
      name,
      email,
      phoneNumber,
      message,
    } = req.body;

    //Validates referenced property to obtain pricing information.
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { pricePerMonth: true, securityDeposit: true },
    });

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    //Transaction ensures lease creation occurs before application creation.
    const newApplication = await prisma.$transaction(async (prisma) => {
      const lease = await prisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          rent: property.pricePerMonth,
          deposit: property.securityDeposit,
          property: { connect: { id: propertyId } },
          tenant: { connect: { cognitoId: tenantCognitoId } },
        },
      });

      const application = await prisma.application.create({
        data: {
          applicationDate: new Date(applicationDate),
          status,
          name,
          email,
          phoneNumber,
          message,
          property: { connect: { id: propertyId } },
          tenant: { connect: { cognitoId: tenantCognitoId } },
          lease: { connect: { id: lease.id } },
        },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });

      return application;
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating application: ${error.message}` });
  }
};

//Updates an application's status and performs related lease/property updates.
//Approval creates a new lease and associates the tenant with the property.
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
      },
    });

    if (!application) {
      res.status(404).json({ message: 'Application not found.' });
      return;
    }

    if (status === 'Approved') {
      const newLease = await prisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      //Links tenant to property for active residence tracking.
      await prisma.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: { connect: { cognitoId: application.tenantCognitoId } },
        },
      });

      //Sync application with its new lease.
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status, leaseId: newLease.id },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });
    } else {
      //Handles denial or any non-approval state.
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status },
      });
    }

    //Final fetch ensures the response reflects the most recent data.
    const updatedApplication = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
        lease: true,
      },
    });

    res.json(updatedApplication);
  } catch (error: any) {
    res.status(500).json({
      message: `Error updating application status: ${error.message}`,
    });
  }
};
