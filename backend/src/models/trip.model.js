import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    travelers: {
      type: Number,
      default: 1,
    },

    tripType: {
      type: String,
      enum: ["solo", "couple", "family", "friends", "business"],
      required: true,
    },

    transportMode: {
      type: String,
      enum: ["flight", "train", "bus", "car", "any"],
      default: "any",
    },

    accommodationType: {
      type: String,
      enum: ["hostel", "hotel", "resort", "homestay", "any"],
      default: "any",
    },

    preferences: [
      {
        type: String,
      },
    ],

    itinerary: {
      type: Object,
      default: null,
    },

    itineraryGenerated: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "planned", "completed", "cancelled"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;