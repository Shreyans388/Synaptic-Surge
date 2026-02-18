import mongoose, { Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  brandsId: Types.ObjectId[];
  role:string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
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
    brandsId: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
