//handlers for application CRUD operations and related lease logic
//manages listing, creating, and updating rental applications
//includes conditional filtering for user roles, formatting property data, lease
//creation within transactions, payment date computation, and status-driven logic
//for approvals, denials, and tenant-property associations
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

//lists applications based on optional tenant or manager context
//when userId and userType are present, results are filtered accordingly
export const getApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    // Dynamic filtering based on user identity and role
    let filterCriteria: any = {};
    if (userId && userType) {
      if (userType === 'tenant') {
        filterCriteria = { tenantCognitoId: String(userId) };
      } else if (userType === 'manager') {
        filterCriteria = {
          property: {
            managerCognitoId: String(userId),
          },
        };
      }
    }

    //fetch applications with related property, tenant, and location data
    const applicationsData = await prisma.application.findMany({
      where: filterCriteria,
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

    //calculates the next payment date based on the lease start date
    function computeNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      return nextPaymentDate;
    }

    //enhances each application with formatted address and lease details
    const formattedApplications = await Promise.all(
      applicationsData.map(async (app) => {
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
                nextPaymentDate: computeNextPaymentDate(lease.startDate),
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

//creates a new application along with an associated lease inside a transaction
//ensures consistent linking of tenant, property, and lease data
export const addApplication = async (
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

    //validates referenced property to obtain pricing information
    const selectedProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { pricePerMonth: true, securityDeposit: true },
    });

    if (!selectedProperty) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    //transaction ensures lease creation occurs before application creation
    const newApplication = await prisma.$transaction(async (prisma) => {
      const lease = await prisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          rent: selectedProperty.pricePerMonth,
          deposit: selectedProperty.securityDeposit,
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

//updates an application's status and performs related lease/property updates
//approval creates a new lease and associates the tenant with the propert
export const setApplicationStatus = async (
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

      //links tenant to property for active residence tracking
      await prisma.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: { connect: { cognitoId: application.tenantCognitoId } },
        },
      });

      //sync application with its new lease
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
      //handles denial or any non-approval state
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status },
      });
    }

    //final fetch ensures the response reflects the most recent data
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
