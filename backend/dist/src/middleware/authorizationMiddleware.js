"use strict";
//Middleware that checks the user's JWT and only allows 
//access if their role is permitted.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//role-based authorization middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Missing or invalid authorization token' });
            return;
        }
        try {
            const decodedToken = jsonwebtoken_1.default.decode(token);
            const userRole = decodedToken['custom:role'] || '';
            req.user = {
                id: decodedToken.sub,
                role: userRole,
            };
            const isAllowed = allowedRoles.includes(userRole.toLowerCase());
            if (!isAllowed) {
                res.status(403).json({ message: 'Forbidden: insufficient role' });
                return;
            }
        }
        catch (err) {
            console.error('Failed to decode token:', err);
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//authorization middleware end
//Functions & Variables:
//requireRole(allowedRoles): Main function that returns the actual middleware.
//allowedRoles: Array of roles allowed to access the route.
//token: The raw JWT taken from the Authorization header.
//decodedToken: The token's payload after decoding.
//userRole: The role extracted from the decoded token ("custom:role").
//req.user: Object attached to the request containing the user’s ID and role.
//isAllowed: Boolean indicating whether the user's role matches any allowed role.
