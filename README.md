# Job Description Analyzer

A backend API that analyzes job descriptions, extracts job requirements, identifies technical skills, and compares them with a candidate's skills.

The project is built with Node.js, Express.js, MongoDB, and Mongoose.

## Live API

https://job-description-analyzer-39bp.onrender.com

## Features

- Detects the job role from a job description
- Extracts known technical skills
- Detects required experience
- Classifies skills as required or preferred
- Extracts requirements and responsibilities
- Compares job requirements with candidate skills
- Calculates a skill match score
- Stores analyses in MongoDB
- Retrieves previous analyses
- Validates API input
- Includes automated tests

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript
- Git & GitHub
- Node.js built-in test runner

## Architecture

```text
Client
  |
  | HTTP Request
  v
Express API
  |
  v
Input Validation
  |
  v
Analysis Service
  |
  +---- Role Detection
  |
  +---- Skill Detection
  |
  +---- Experience Detection
  |
  +---- Requirement Extraction
  |
  +---- Candidate Skill Matching
  |
  +---- Match Score
  |
  v
MongoDB
  |
  v
JSON Response