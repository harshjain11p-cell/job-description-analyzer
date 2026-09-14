import express from "express";
import Analysis from "../models/analysis.js";
import { analyzeJobDescription } from "../services/analysisService.js";
import { analyzeWithAI } from "../services/aiAnalysisService.js";

const router = express.Router();


router.post("/analyze", async (req, res) => {
    try {
        const {
            jobDescription,
            candidateSkills = []
        } = req.body;

        if (
            typeof jobDescription !== "string" ||
            jobDescription.trim() === ""
        ) {
            return res.status(400).json({
                error: "Valid job description is required"
            });
        }

        if (!Array.isArray(candidateSkills)) {
            return res.status(400).json({
                error: "candidateSkills must be an array"
            });
        }

        if (
            candidateSkills.some(
                skill => typeof skill !== "string"
            )
        ) {
            return res.status(400).json({
                error: "Every candidate skill must be a string"
            });
        }

        const cleanedCandidateSkills = [
            ...new Set(
                candidateSkills
                    .map(skill => skill.trim())
                    .filter(skill => skill !== "")
            )
        ];

        // Basic rule-based analysis
        const result = analyzeJobDescription(
        jobDescription,
        cleanedCandidateSkills
        );

        const aiResult = await analyzeWithAI(
        jobDescription,
        cleanedCandidateSkills,
        result
        );

        // Save combined analysis to MongoDB
        const analysis = await Analysis.create({
            jobDescription: jobDescription.trim(),
            candidateSkills: cleanedCandidateSkills,
            ...result,
            aiAnalysis: aiResult
        });

        res.status(201).json({
            id: analysis._id,

            role: analysis.role,
            skills: analysis.skills,
            experience: analysis.experience,

            requiredSkills: analysis.requiredSkills,
            preferredSkills: analysis.preferredSkills,
            unclassifiedSkills: analysis.unclassifiedSkills,

            candidateSkills: analysis.candidateSkills,
            matchedSkills: analysis.matchedSkills,
            missingSkills: analysis.missingSkills,
            matchScore: analysis.matchScore,

            requirements: analysis.requirements,
            responsibilities: analysis.responsibilities,

            aiAnalysis: analysis.aiAnalysis
        });

    } catch (error) {
        console.error("Analysis error:", error);

        res.status(500).json({
            error: "Failed to analyze job description"
        });
    }
});

/*
 * GET /analyses
 *
 * Optional query parameters:
 *
 * ?role=Backend Developer
 * ?limit=5
 *
 * Examples:
 *
 * GET /analyses
 * GET /analyses?role=Backend%20Developer
 * GET /analyses?limit=5
 * GET /analyses?role=Backend%20Developer&limit=5
 */
router.get("/analyses", async (req, res) => {
    try {
        const {
            role,
            limit = 10
        } = req.query;

        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 50
        ) {
            return res.status(400).json({
                error: "limit must be an integer between 1 and 50"
            });
        }

        const filter = {};

        if (role) {
            filter.role = role;
        }

        const analyses = await Analysis.find(filter)
            .sort({ createdAt: -1 })
            .limit(parsedLimit)
            .select(
                "_id role experience skills requiredSkills preferredSkills candidateSkills matchedSkills missingSkills matchScore createdAt"
            );

        res.json({
            count: analyses.length,
            analyses
        });

    } catch (error) {
        console.error("Fetch analyses error:", error);

        res.status(500).json({
            error: "Failed to fetch analyses"
        });
    }
});


router.get("/analyses/:id", async (req, res) => {
    try {
        const analysis = await Analysis.findById(
            req.params.id
        );

        if (!analysis) {
            return res.status(404).json({
                error: "Analysis not found"
            });
        }

        res.json(analysis);

    } catch (error) {
        console.error("Fetch analysis error:", error);

        res.status(400).json({
            error: "Invalid analysis ID"
        });
    }
});


export default router;