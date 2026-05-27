import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // The human-readable unique ID printed on the machine e.g. "VM-BPL-001"
    device_id: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,  // Always store in uppercase for consistency
      trim: true,
    },

    machine_name: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["REGISTERED", "ACTIVE", "MAINTENANCE", "DISABLED"],
      default: "REGISTERED",
    },

    // Added: physical location of the machine — critical for field operations
    location: {
      address: { type: String, default: null },
      city:    { type: String, default: null },
      state:   { type: String, default: null },
      pincode: { type: String, default: null },
    },

    // Added: assigned technician for this machine
    assigned_technician_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Added: timestamp of the last telemetry ping received from the device
    // Used to detect offline machines
    last_seen_at: {
      type: Date,
      default: null,
    },

    // Added: firmware version running on the device
    firmware_version: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);