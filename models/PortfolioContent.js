import mongoose from "mongoose";

const PortfolioContentSchema = new mongoose.Schema(
    {
        section: {
            type: String,
            required: true,
            unique: true,
            enum: ["header", "about", "work", "certifications"],
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.PortfolioContent ||
    mongoose.model("PortfolioContent", PortfolioContentSchema);
