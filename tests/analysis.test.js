import test from "node:test";
import assert from "node:assert";
import { analyzeJobDescription } from "../services/analysisService.js";


test("should detect backend skills and role", () => {

    const result = analyzeJobDescription(
        "We are looking for a Backend Developer with experience in Node.js, Express.js and MongoDB."
    );

    assert.strictEqual(result.role, "Backend Developer");

    assert.deepStrictEqual(result.skills, [
        "Node.js",
        "Express.js",
        "MongoDB"
    ]);

    assert.strictEqual(result.experience, null);
});


test("should detect experience", () => {

    const result = analyzeJobDescription(
        "Backend Developer with 2 years of experience in Node.js."
    );

    assert.strictEqual(result.role, "Backend Developer");
    assert.strictEqual(result.experience, "2 years");
});


test("should calculate match score", () => {

    const result = analyzeJobDescription(
        "Backend Developer using Node.js, Express.js, MongoDB and JavaScript."
    );

    assert.strictEqual(result.matchScore, 57);
});


test("should identify missing skills", () => {

    const result = analyzeJobDescription(
        "Backend Developer using Node.js and MongoDB."
    );

    assert.ok(result.missingSkills.includes("Express.js"));
    assert.ok(result.missingSkills.includes("PostgreSQL"));
    assert.ok(result.missingSkills.includes("Python"));
});