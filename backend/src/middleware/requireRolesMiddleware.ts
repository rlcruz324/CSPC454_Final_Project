//Middleware that checks the user's JWT and only allows 
//access if their role is permitted.

//This middleware enforces role-based authorization by reading the JWT from the
//Authorization header, decoding it, and extracting the user's role. 
//compares the role in the token against a list of allowed roles for the route. 
//If the token is missing, invalid, or the user lacks the required role, 
//the request is rejected with a status code. 
//When valid, it attaches the user's ID and role to
//req.user and passes control to the next handler.
//This is kinda the most important part considering it manages roles and users



import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  sub: string;
  'custom:role'?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

//role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Missing or invalid authorization token' });
      return;
    }

    try {
      const decodedToken = jwt.decode(token) as DecodedToken;
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
    } catch (err) {
      console.error('Failed to decode token:', err);
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    next();
  };
};
//authorization middleware end



//Functions & Variables:
//requireRole(allowedRoles): Main function that returns the actual middleware.
//allowedRoles: Array of roles allowed to access the route.
//token: The raw JWT taken from the Authorization header.
//decodedToken: The token's payload after decoding.
//userRole: The role extracted from the decoded token ("custom:role").
//req.user: Object attached to the request containing the user’s ID and role.
//isAllowed: Boolean indicating whether the user's role matches any allowed role.
