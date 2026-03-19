const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },

    // phone: {
    //   type: String,
    //   trim: true,
    // },

    profile: {
      type: String,
      default: "",
    },

    // permissions: {
    //   users: {
    //     view: { type: Boolean, default: true },
    //     create: { type: Boolean, default: true },
    //     edit: { type: Boolean, default: true },
    //     delete: { type: Boolean, default: false },
    //   },
    //   products: {
    //     view: { type: Boolean, default: true },
    //     create: { type: Boolean, default: true },
    //     edit: { type: Boolean, default: true },
    //     delete: { type: Boolean, default: true },
    //   },
    //   orders: {
    //     view: { type: Boolean, default: true },
    //     edit: { type: Boolean, default: true },
    //   },
    // },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },

    loginToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", adminSchema);