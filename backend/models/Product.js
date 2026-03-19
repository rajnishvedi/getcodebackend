const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["vegetable", "fruit"],
      required: true
    },

    description: {
      type: String,
      trim: true
    },

    images: [
      {
        url: {
          type: String
        },
        alt: {
          type: String
        }
      }
    ],

    pricing: {
      price: {
        type: Number,
        required: true,
        min: 0
      },
      oldPrice: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: "INR"
      }
    },

    unit: {
      type: String,
      enum: ["kg", "gram", "piece", "dozen"],
      default: "kg"
    },

    stock: {
      quantity: {
        type: Number,
        default: 0
      },
      inStock: {
        type: Boolean,
        default: true
      }
    },

    tags: [
      {
        type: String,
        enum: ["new", "organic", "seasonal", "popular", "discount"]
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", ProductSchema);