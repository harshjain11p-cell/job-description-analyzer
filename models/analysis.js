import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
    {
        jobDescription: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: null
        },

        skills: {
            type: [String],
            default: []
        },

        experience: {
            type: String,
            default: null
        },

        missingSkills: {
            type: [String],
            default: []
        },

        matchScore: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;