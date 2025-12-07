"use strict";
//Handlers for retrieving leases and lease payments.
//Provides controller functions for fetching all leases with
//related tenant and property data, and for retrieving payment records for a
//specific lease. Includes Prisma queries, error handling, and structured JSON
//responses.
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
exports.getLeasePayments = exports.getLeases = void 0;
//Third-party libraries
//Project modules (lib, utils, state, constants)
const client_1 = require("@prisma/client");
//Prisma client instance for database operations. Shared across handlers.
const prisma = new client_1.PrismaClient();
//Retrieves all leases, including related tenant and property data.
//Enables frontend to display complete lease information in one request.
const getLeases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leases = yield prisma.lease.findMany({
            include: {
                tenant: true,
                property: true,
            },
        });
        res.json(leases);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving leases: ${error.message}` });
    }
});
exports.getLeases = getLeases;
//Retrieves all payments associated with a specific lease ID.
//Converts the ID param to a number before querying the database.
//Useful for showing detailed payment history in UI.
const getLeasePayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payments = yield prisma.payment.findMany({
            where: { leaseId: Number(id) },
        });
        res.json(payments);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving lease payments: ${error.message}` });
    }
});
exports.getLeasePayments = getLeasePayments;
