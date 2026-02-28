
import { Schema, model, Types } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  fullName: string;
  brandsId: Types.ObjectId[];
  role: "user" | "admin";
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    brandsId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);