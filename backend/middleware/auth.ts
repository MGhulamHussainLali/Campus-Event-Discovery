import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    console.log(req.headers)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded;
        next();
    } catch (err: any) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function authorize(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;
        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
    }

}
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
    const user = (req as any).user;
    if (!user || !user.isSuperAdmin) {
        res.status(403).json({ error: 'Super admin access required' });
        return;
    }
    next();
}