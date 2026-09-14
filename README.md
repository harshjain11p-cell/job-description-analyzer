# Job Description Analyzer

A backend API that analyzes job descriptions, extracts important information, identifies required skills, and compares those skills with a candidate's skill set.

## Features

- Detects the job role from a job description
- Extracts technical skills using keyword matching
- Detects required experience
- Extracts requirements and responsibilities
- Compares job requirements with candidate skills
- Calculates a candidate-to-job skill match score
- Stores analyses in MongoDB
- Provides APIs to retrieve previous analyses
- Validates incoming API requests
- Includes automated unit tests

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript
- Git & GitHub
- Node.js built-in test runner

## Project Structure

```text
Project-1-Job-Description-Analyzer/
├── app.js
├── server.js
├── config/
│   └── db.js
├── data/
│   └── skillData.js
├── models/
│   └── analysis.js
├── routes/
│   └── analysisRoutes.js
├── services/
│   └── analysisService.js
├── tests/
│   └── analysis.test.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md