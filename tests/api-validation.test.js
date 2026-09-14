import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../app.js";


test("rejects missing job description", async () => {
    const response = await request(app)
        .post("/analyze")
        .send({});

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "Valid job description is required"
        }
    );
});


test("rejects empty job description", async () => {
    const response = await request(app)
        .post("/analyze")
        .send({
            jobDescription: "   "
        });

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "Valid job description is required"
        }
    );
});


test("rejects non-string job description", async () => {
    const response = await request(app)
        .post("/analyze")
        .send({
            jobDescription: 12345
        });

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "Valid job description is required"
        }
    );
});


test("rejects candidateSkills when it is not an array", async () => {
    const response = await request(app)
        .post("/analyze")
        .send({
            jobDescription: "Backend Developer with Node.js",
            candidateSkills: "Node.js"
        });

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "candidateSkills must be an array"
        }
    );
});


test("rejects candidateSkills containing non-string values", async () => {
    const response = await request(app)
        .post("/analyze")
        .send({
            jobDescription: "Backend Developer with Node.js",
            candidateSkills: [
                "Node.js",
                123
            ]
        });

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "Every candidate skill must be a string"
        }
    );
});

test("rejects invalid analysis limit", async () => {
    const response = await request(app)
        .get("/analyses?limit=0");

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "limit must be an integer between 1 and 50"
        }
    );
});


test("rejects analysis limit greater than 50", async () => {
    const response = await request(app)
        .get("/analyses?limit=51");

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "limit must be an integer between 1 and 50"
        }
    );
});

test("rejects an invalid analysis ID", async () => {
    const response = await request(app)
        .get("/analyses/not-a-valid-mongodb-id");

    assert.equal(response.status, 400);

    assert.deepEqual(
        response.body,
        {
            error: "Invalid analysis ID"
        }
    );
});


