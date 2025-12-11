"use strict";
//Handlers for application CRUD operations and related lease logic.
//Manages listing, creating, and updating rental applications.
//Includes conditional filtering for user roles, formatting property data, lease
//creation within transactions, payment date computation, and status-driven logic
//for approvals, denials, and tenant-property associations.
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
exports.setApplicationStatus = exports.addApplication = exports.getApplications = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//Lists applications based on optional tenant or manager context.
//When userId and userType are present, results are filtered accordingly.
const getApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userType } = req.query;
        // Dynamic filtering based on user identity and role.
        let filterCriteria = {};
        if (userId && userType) {
            if (userType === 'tenant') {
                filterCriteria = { tenantCognitoId: String(userId) };
            }
            else if (userType === 'manager') {
                filterCriteria = {
                    property: {
                        managerCognitoId: String(userId),
                    },
                };
            }
        }
        //Fetch applications with related property, tenant, and location data.
        const applicationsData = yield prisma.application.findMany({
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
        //Calculates the next payment date based on the lease start date.
        function computeNextPaymentDate(startDate) {
            const today = new Date();
            const nextPaymentDate = new Date(startDate);
            while (nextPaymentDate <= today) {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            }
            return nextPaymentDate;
        }
        //Enhances each application with formatted address and lease details.
        const formattedApplications = yield Promise.all(applicationsData.map((app) => __awaiter(void 0, void 0, void 0, function* () {
            const lease = yield prisma.lease.findFirst({
                where: {
                    tenant: { cognitoId: app.tenantCognitoId },
                    propertyId: app.propertyId,
                },
                orderBy: { startDate: 'desc' },
            });
            return Object.assign(Object.assign({}, app), { property: Object.assign(Object.assign({}, app.property), { address: app.property.location.address }), manager: app.property.manager, lease: lease
                    ? Object.assign(Object.assign({}, lease), { nextPaymentDate: computeNextPaymentDate(lease.startDate) }) : null });
        })));
        res.json(formattedApplications);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving applications: ${error.message}` });
    }
});
exports.getApplications = getApplications;
//Creates a new application along with an associated lease inside a transaction.
//Ensures consistent linking of tenant, property, and lease data.
const addApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationDate, status, propertyId, tenantCognitoId, name, email, phoneNumber, message, } = req.body;
        //Validates referenced property to obtain pricing information.
        const selectedProperty = yield prisma.property.findUnique({
            where: { id: propertyId },
            select: { pricePerMonth: true, securityDeposit: true },
        });
        if (!selectedProperty) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        //Transaction ensures lease creation occurs before application creation.
        const newApplication = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const lease = yield prisma.lease.create({
                data: {
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    rent: selectedProperty.pricePerMonth,
                    deposit: selectedProperty.securityDeposit,
                    property: { connect: { id: propertyId } },
                    tenant: { connect: { cognitoId: tenantCognitoId } },
                },
            });
            const application = yield prisma.application.create({
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
        }));
        res.status(201).json(newApplication);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating application: ${error.message}` });
    }
});
exports.addApplication = addApplication;
//Updates an application's status and performs related lease/property updates.
//Approval creates a new lease and associates the tenant with the property.
const setApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = yield prisma.application.findUnique({
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
            const newLease = yield prisma.lease.create({
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
            yield prisma.property.update({
                where: { id: application.propertyId },
                data: {
                    tenants: { connect: { cognitoId: application.tenantCognitoId } },
                },
            });
            //Sync application with its new lease.
            yield prisma.application.update({
                where: { id: Number(id) },
                data: { status, leaseId: newLease.id },
                include: {
                    property: true,
                    tenant: true,
                    lease: true,
                },
            });
        }
        else {
            //Handles denial or any non-approval state.
            yield prisma.application.update({
                where: { id: Number(id) },
                data: { status },
            });
        }
        //Final fetch ensures the response reflects the most recent data.
        const updatedApplication = yield prisma.application.findUnique({
            where: { id: Number(id) },
            include: {
                property: true,
                tenant: true,
                lease: true,
            },
        });
        res.json(updatedApplication);
    }
    catch (error) {
        res.status(500).json({
            message: `Error updating application status: ${error.message}`,
        });
    }
});
exports.setApplicationStatus = setApplicationStatus;
