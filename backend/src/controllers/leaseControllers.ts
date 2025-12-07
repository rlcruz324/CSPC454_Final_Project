//Handlers for retrieving leases and lease payments.
//Provides controller functions for fetching all leases with
//related tenant and property data, and for retrieving payment records for a
//specific lease. Includes Prisma queries, error handling, and structured JSON
//responses.

//React
import { Request, Response } from 'express';

//Third-party libraries

//Project modules (lib, utils, state, constants)
import { PrismaClient } from '@prisma/client';

//Prisma client instance for database operations. Shared across handlers.
const prisma = new PrismaClient();

//Retrieves all leases, including related tenant and property data.
//Enables frontend to display complete lease information in one request.
export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });

    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

//Retrieves all payments associated with a specific lease ID.
//Converts the ID param to a number before querying the database.
//Useful for showing detailed payment history in UI.
export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });

    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};
