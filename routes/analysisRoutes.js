import express from "express";
import Analysis from "../models/analysis.js";
import { analyzeJobDescription } from "../services/analysisService.js";

const router = express.Router();


router.post("/analyze", async (req, res) => {
    try {
        const {
            jobDescription,
            candidateSkills = []
        } = req.body;


        // Validate job description
        if (
            typeof jobDescription !== "string" ||
            jobDescription.trim() === ""
        ) {
            return res.status(400).json({
                error: "Valid job description is required"
            });
        }


        // Validate candidate skills
        if (!Array.isArray(candidateSkills)) {
            return res.status(400).json({
                error: "candidateSkills must be an array"
            });
        }


        // Every candidate skill must be a string
        if (
            candidateSkills.some(
                skill => typeof skill !== "string"
            )
        ) {
            return res.status(400).json({
                error: "Every candidate skill must be a string"
            });
        }


        // Clean and remove duplicate skills
        const cleanedCandidateSkills = [
            ...new Set(
                candidateSkills
                    .map(skill => skill.trim())
                    .filter(skill => skill !== "")
            )
        ];


        const result = analyzeJobDescription(
            jobDescription,
            cleanedCandidateSkills
        );


        const analysis = await Analysis.create({
            jobDescription: jobDescription.trim(),
            candidateSkills: cleanedCandidateSkills,
            ...result
        });


        res.status(201).json({
            id: analysis._id,
            role: analysis.role,
            skills: analysis.skills,
            experience: analysis.experience,
            candidateSkills: analysis.candidateSkills,
            matchedSkills: analysis.matchedSkills,
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