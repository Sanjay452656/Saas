import mongoose from mongoose;

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}