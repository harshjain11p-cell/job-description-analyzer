import express from "express";
import Analysis from "../models/analysis.js";
import { analyzeJobDescription } from "../services/analysisService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (
            typeof jobDescription !== "string" ||
            jobDescription.trim() === ""
        ) {
            return res.status(400).json({
                error: "Valid job description is required"
            });
        }

        const result = analyzeJobDescription(jobDescription);

        const analysis = await Analysis.create({
            jobDescription: jobDescription.trim(),
            ...result
        });

        res.status(201).json({
            id: analysis._id,
            role: analysis.role,
            skills: analysis.skills,
            experience: analysis.experience,
            missingSkills: analysis.missingSkills,
            matchScore: analysis.matchScore,
            requirements: analysis.requirements,
            responsibilities: analysis.responsibilities
        });

    } catch (error) {
        console.error("Analysis error:", error);

        res.status(500).json({
            error: "Failed to analyze job description"
        });
    }
});


router.get("/analyses", async (req, res) => {
    try {
        const analyses = await Analysis.find()
            .sort({ createdAt: -1 });

        res.json(analyses);

    } catch (error) {
        console.error("Fetch analyses error:", error);

        res.status(500).json({
            error: "Failed to fetch analyses"
        });
    }
});


export default router;