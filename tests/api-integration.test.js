import "dotenv/config";

import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";

import app from "../app.js";
import Analysis from "../models/analysis.js";
import { connectDB } from "../config/db.js";


await connectDB();


test("analyzes a valid job description through the full API pipeline", async () => {
    let createdAnalysisId;

    try {
        const response = await request(app)
            .post("/analyze")
            .send({
                jobDescription:
                    "We are hiring a Backend Developer with Node.js, Express.js, MongoDB and PostgreSQL. 2 years experience required. Experience building REST APIs is preferred.",

                candidateSkills: [
                    "Node.js",
                    "MongoDB",
                    "JavaScript"
                ]
            });

        assert.equal(response.status, 201);

        const data = response.body;

        assert.ok(data.id);

        createdAnalysisId = data.id;

        assert.equal(
            data.role,
            "Backend Developer"
        );

        assert.equal(
            data.experience,
            "2 years"
        );

        assert.deepEqual(
            data.skills,
            [
                "Node.js",
                "Express.js",
                "MongoDB",
                "PostgreSQL",
                "REST APIs"
            ]
        );

        assert.deepEqual(
            data.candidateSkills,
            [
                "Node.js",
                "MongoDB",
                "JavaScript"
            ]
        );

        assert.deepEqual(
            data.matchedSkills,
            [
                "Node.js",
                "MongoDB"
            ]
        );

        assert.deepEqual(
            data.missingSkills,
            [
                "Express.js",
                "PostgreSQL",
                "REST APIs"
            ]
        );

        assert.equal(
            data.matchScore,
            44
        );

        assert.ok(data.aiAnalysis);

        assert.equal(
            typeof data.aiAnalysis.summary,
            "string"
        );

        assert.ok(
            data.aiAnalysis.summary.length > 0
        );

        assert.ok(
            Array.isArray(data.aiAnalysis.keySkills)
        );

        assert.ok(
            Array.isArray(data.aiAnalysis.skillGaps)
        );

        assert.ok(
            Array.isArray(data.aiAnalysis.recommendations)
        );

        assert.ok(
            Array.isArray(data.aiAnalysis.interviewTopics)
        );

        const savedAnalysis =
            await Analysis.findById(createdAnalysisId);

        assert.ok(savedAnalysis);

        assert.equal(
            savedAnalysis.role,
            "Backend Developer"
        );

        assert.equal(
            savedAnalysis.matchScore,
            44
        );

        assert.ok(
            savedAnalysis.aiAnalysis
        );

    } finally {
        if (createdAnalysisId) {
            await Analysis.findByIdAndDelete(
                createdAnalysisId
            );
        }
    }
});


test.after(async () => {
    await mongoose.connection.close();
});