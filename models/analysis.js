import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
    {
        jobDescription: {
            type: String,
            required: true
        },

        candidateSkills: {
            type: [String],
            default: []
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

        requiredSkills: {
            type: [String],
            default: []
        },

        preferredSkills: {
            type: [String],
            default: []
        },

        unclassifiedSkills: {
            type: [String],
            default: []
        },

        matchedSkills: {
            type: [String],
            default: []
        },

        missingSkills: {
            type: [String],
            default: []
        },

        matchScore: {
            type: Number,
            default: null
        },

        requirements: {
            type: [String],
            default: []
        },

        responsibilities: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;