import mongoose from mongoose

const userSchema = new mongoose.Schema({
    company_id:{
        type:String,
        ref:"company",
        required:true
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    password_hash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "TECHNICIAN"],
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
},{timestamps: true});

export default mongoose.model("User", userSchema);