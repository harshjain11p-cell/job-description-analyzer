import test from "node:test";
import assert from "node:assert/strict";

import { analyzeJobDescription } from "../services/analysisService.js";


test("detects role, skills and experience", () => {
    const result = analyzeJobDescription(
        "We are looking for a Backend Developer with 2 years of experience in Node.js, Express.js and MongoDB."
    );

    assert.equal(result.role, "Backend Developer");

    assert.deepEqual(
        result.skills,
        ["Node.js", "Express.js", "MongoDB"]
    );

    assert.equal(result.experience, "2 years");
});


test("calculates candidate skill match correctly", () => {
    const result = analyzeJobDescription(
        "Backend Developer required with Node.js, Express.js, MongoDB and PostgreSQL.",
        [
            "Node.js",
            "Express.js",
            "MongoDB"
        ]
    );

    assert.deepEqual(
        result.matchedSkills,
        ["Node.js", "Express.js", "MongoDB"]
    );

    assert.deepEqual(
        result.missingSkills,
        ["PostgreSQL"]
    );

    assert.equal(result.matchScore, 75);
});


test("returns null match score when candidate skills are not provided", () => {
    const result = analyzeJobDescription(
        "Backend Developer required with Node.js and MongoDB."
    );

    assert.equal(result.matchScore, null);
});


test("detects fresher or entry-level roles", () => {
    const result = analyzeJobDescription(
        "We are hiring a Backend Developer. This is an entry-level position requiring Node.js."
    );

    assert.equal(
        result.experience,
        "Fresher / Entry Level"
    );
});


test("detects experience with minimum requirement", () => {
    const result = analyzeJobDescription(
        "Backend Developer with minimum 3 years of experience in Node.js."
    );

    assert.equal(
        result.experience,
        "3 years"
    );
});


test("detects skill aliases", () => {
    const result = analyzeJobDescription(
        "Backend engineer required with NodeJS, PostgreSQL and RESTful API experience."
    );

    assert.ok(result.skills.includes("Node.js"));
    assert.ok(result.skills.includes("PostgreSQL"));
    assert.ok(result.skills.includes("REST APIs"));
});


test("does not detect unrelated skills", () => {
    const result = analyzeJobDescription(
        "We are looking for a Backend Developer with Node.js experience."
    );

    assert.ok(result.skills.includes("Node.js"));
    assert.ok(!result.skills.includes("React"));
    assert.ok(!result.skills.includes("Python"));
});


test("extracts responsibilities", () => {
    const result = analyzeJobDescription(
        `Backend Developer

Responsibilities:
Build REST APIs
Design backend services
Work with databases

Requirements:
2 years of experience
Node.js
MongoDB`
    );

    assert.ok(result.responsibilities.length > 0);
});


test("extracts requirements", () => {
    const result = analyzeJobDescription(
        `Backend Developer

Requirements:
2 years of experience
Node.js
MongoDB
PostgreSQL

Responsibilities:
Build backend services`
    );

    assert.ok(result.requirements.length > 0);
});


test("handles empty candidate skills", () => {
    const result = analyzeJobDescription(
        "Backend Developer with Node.js and MongoDB.",
        []
    );

    assert.deepEqual(result.matchedSkills, []);
    assert.deepEqual(
        result.missingSkills,
        ["Node.js", "MongoDB"]
    );
    assert.equal(result.matchScore, null);
});


test("handles mixed capitalization in job description", () => {
    const result = analyzeJobDescription(
        "BACKEND DEVELOPER with NODE.JS and MONGODB experience."
    );

    assert.equal(result.role, "Backend Developer");

    assert.ok(result.skills.includes("Node.js"));
    assert.ok(result.skills.includes("MongoDB"));
});


test("handles common experience variations", () => {
    const result = analyzeJobDescription(
        "Software Engineer with at least 4 yrs experience in Python."
    );

    assert.equal(result.experience, "4 years");
});


test("returns null for unknown role and experience", () => {
    const result = analyzeJobDescription(
        "Looking for someone who can build useful software."
    );

    assert.equal(result.role, null);
    assert.equal(result.experience, null);
    assert.deepEqual(result.skills, []);
});


test("does not calculate a false match score without job skills", () => {
    const result = analyzeJobDescription(
        "We are looking for a general software professional.",
        ["Node.js", "MongoDB"]
    );

    assert.equal(result.matchScore, 0);
    assert.deepEqual(result.matchedSkills, []);
});