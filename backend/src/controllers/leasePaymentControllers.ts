//problematic component always returns errors

//handlers for retrieving leases and lease payments
//provides controller functions for fetching all leases with
//related tenant and property data and for retrieving payment records for a
//specific lease includes prisma queries error handling and structured json
//responses

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//controller getleases start
export const listLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const fetchedLeases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });

    res.json(fetchedLeases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

//retrieves all payments associated with a specific lease id
//converts the id param to a number before querying the database
//useful for showing detailed payment history in ui

//controller getleasepayments
export const listLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const fetchedPayments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });

    res.json(fetchedPayments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};
