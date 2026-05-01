import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    referenceType: {
      type: String,
      enum: ["Project", "Task", "User"],
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ project: 1, timestamp: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
