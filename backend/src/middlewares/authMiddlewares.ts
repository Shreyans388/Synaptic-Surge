import  type{ Request, Response, NextFunction } from "express";
import jwt  from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken"
import User from "../models/userModel.js";
import type { IUser } from "../models/userModel.js";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.jwt as string | undefined;

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    if (!decoded?.userId) {
      res.status(401).json({ message: "Unauthorized - Invalid token" });
      return;
    }

    const user = await User.findById(decoded.userId)
      .select("-password")
      .lean<IUser>();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

