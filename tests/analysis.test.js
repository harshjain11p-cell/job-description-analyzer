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

test("normalizes candidate skill aliases", () => {
    const result = analyzeJobDescription(
        "Backend Developer required with Node.js, PostgreSQL and RESTful API experience.",
        [
            "NodeJS",
            "Postgres",
            "RESTful API"
        ]
    );

    assert.deepEqual(
        result.matchedSkills,
        [
            "Node.js",
            "PostgreSQL",
            "REST APIs"
        ]
    );

    assert.equal(result.matchScore, 100);
});


test("normalizes candidate skill capitalization", () => {
    const result = analyzeJobDescription(
        "Backend Developer required with Node.js and MongoDB.",
        [
            "NODE.JS",
            "mongodb"
        ]
    );

    assert.deepEqual(
        result.matchedSkills,
        [
            "Node.js",
            "MongoDB"
        ]
    );

    assert.equal(result.matchScore, 100);
});


test("ignores unknown candidate skills", () => {
    const result = analyzeJobDescription(
        "Backend Developer required with Node.js.",
        [
            "NodeJS",
            "SomethingThatDoesNotExist"
        ]
    );

    assert.deepEqual(
        result.matchedSkills,
        ["Node.js"]
    );

    assert.equal(result.matchScore, 100);
});

test("classifies required and preferred skills", () => {
    const result = analyzeJobDescription(
        `Backend Developer

Requirements:
Node.js
JavaScript
MongoDB

Nice to have:
Docker
Redis
`,
        [
            "Node.js",
            "JavaScript",
            "MongoDB"
        ]
    );

    assert.deepEqual(
        result.requiredSkills,
        [
            "Node.js",
            "JavaScript",
            "MongoDB"
        ]
    );

    assert.deepEqual(
        result.preferredSkills,
        [
            "Docker",
            "Redis"
        ]
    );
});


test("weights required skills more than preferred skills", () => {
    const result = analyzeJobDescription(
        `Backend Developer

Requirements:
Node.js
JavaScript

Nice to have:
Docker
Redis
`,
        [
            "Node.js",
            "JavaScript"
        ]
    );

    assert.equal(result.matchScore, 67);
});


test("preferred skill match improves weighted score", () => {
    const result = analyzeJobDescription(
        `Backend Developer

Requirements:
Node.js
JavaScript

Nice to have:
Docker
Redis
`,
        [
            "Node.js",
            "JavaScript",
            "Docker"
        ]
    );

    assert.equal(result.matchScore, 83);
});

test("classifies skills correctly in a realistic job description", () => {
    const result = analyzeJobDescription(
        `We are looking for a Backend Developer to build and maintain scalable backend services.

The ideal candidate should have 1+ years of experience with Node.js, Express.js, JavaScript and MongoDB.

Experience with RESTful APIs is required.

Knowledge of PostgreSQL is preferred.

Docker and Redis are nice to have.
`,
        [
            "NodeJS",
            "Express",
            "JavaScript",
            "MongoDB",
            "REST APIs",
            "Docker"
        ]
    );

    assert.deepEqual(
        result.requiredSkills,
        [
            "Node.js",
            "Express.js",
            "MongoDB",
            "JavaScript",
            "REST APIs"
        ]
    );

    assert.deepEqual(
        result.preferredSkills,
        [
            "PostgreSQL",
            "Docker",
            "Redis"
        ]
    );

    assert.deepEqual(
        result.unclassifiedSkills,
        []
    );

    assert.equal(
        result.matchScore,
        85
    );
});