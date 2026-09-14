# Job Description Analyzer

A backend API that analyzes job descriptions, extracts job requirements and technical skills, compares them with a candidate's skills, calculates a match score, and generates an AI-assisted analysis.

The project combines deterministic rule-based analysis with Gemini-powered AI analysis and stores completed analyses in MongoDB.

## Live API

https://job-description-analyzer-39bp.onrender.com

## Features

* Detects the job role from a job description
* Extracts known technical skills
* Detects required experience
* Classifies skills as required or preferred
* Extracts requirements and responsibilities
* Compares job requirements with candidate skills
* Calculates a skill match score
* Generates AI-assisted analysis using Gemini
* Identifies candidate strengths and skill gaps
* Generates recommendations and interview topics
* Stores analyses in MongoDB
* Retrieves previous analyses
* Validates API input
* Includes automated unit, API validation, and integration tests

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JavaScript
* Google Gemini API
* Git & GitHub
* Node.js built-in test runner
* Supertest

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
Rule-Based Analysis
  |
  +---- Role Detection
  +---- Skill Detection
  +---- Experience Detection
  +---- Requirement Extraction
  +---- Candidate Skill Matching
  +---- Match Score
  |
  v
AI Analysis
  |
  +---- Summary
  +---- Seniority
  +---- Key Skills
  +---- Skill Gaps
  +---- Candidate Strengths
  +---- Recommendations
  +---- Interview Topics
  |
  v
MongoDB
  |
  v
JSON Response
```

## API

### POST `/analyze`

Analyzes a job description against a candidate's skills.

#### Request

```json
{
  "jobDescription": "We are hiring a Backend Developer with Node.js, Express.js, MongoDB and PostgreSQL. 2 years experience required. Experience building REST APIs is preferred.",
  "candidateSkills": [
    "Node.js",
    "MongoDB",
    "JavaScript"
  ]
}
```

#### Response

```json
{
  "role": "Backend Developer",
  "skills": [
    "Node.js",
    "Express.js",
    "MongoDB",
    "PostgreSQL",
    "REST APIs"
  ],
  "experience": "2 years",
  "requiredSkills": [
    "Node.js",
    "Express.js",
    "MongoDB",
    "PostgreSQL"
  ],
  "preferredSkills": [
    "REST APIs"
  ],
  "candidateSkills": [
    "Node.js",
    "MongoDB",
    "JavaScript"
  ],
  "matchedSkills": [
    "Node.js",
    "MongoDB"
  ],
  "missingSkills": [
    "Express.js",
    "PostgreSQL",
    "REST APIs"
  ],
  "matchScore": 44,
  "aiAnalysis": {
    "seniority": "Junior",
    "keySkills": [
      "Node.js",
      "Express.js",
      "MongoDB",
      "PostgreSQL",
      "REST APIs"
    ],
    "skillGaps": [
      "Express.js",
      "PostgreSQL",
      "REST APIs"
    ]
  }
}
```

## Other Endpoints

### GET `/analyses`

Retrieves previously stored analyses.

Optional query parameters:

```text
?role=Backend Developer
?limit=10
```

### GET `/analyses/:id`

Retrieves a specific analysis by its MongoDB ID.

## Project Structure

```text
Project-1-Job-Description-Analyzer/
│
├── config/
│   └── db.js
│
├── data/
│   └── skillData.js
│
├── models/
│   └── analysis.js
│
├── routes/
│   └── analysisRoutes.js
│
├── services/
│   ├── analysisService.js
│   ├── aiAnalysisService.js
│   └── aiAnalysisService.backup.js
│
├── tests/
│   ├── analysis.test.js
│   ├── api-validation.test.js
│   └── api-integration.test.js
│
├── app.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## How It Works

The analyzer uses two complementary layers.

### 1. Deterministic Analysis

The backend first processes the job description using predefined rules and skill data.

This layer determines:

* Role
* Technical skills
* Experience
* Required skills
* Preferred skills
* Requirements
* Responsibilities
* Matched skills
* Missing skills
* Match score

This provides predictable and structured results.

### 2. AI Analysis

The deterministic results are then provided to Gemini as context.

The AI generates:

* Summary
* Seniority
* Key skills
* Skill gaps
* Candidate strengths
* Recommendations
* Interview topics

The AI is instructed to treat the deterministic backend analysis as the source of truth for the factual analysis.

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/harshjain11p-cell/job-description-analyzer.git
cd job-description-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the server

```bash
npm start
```

The API will run on:

```text
http://localhost:3000
```

## Testing

Run the unit and API validation tests:

```bash
npm test
```

Run the MongoDB integration test:

```bash
npm run test:integration
```

The integration test exercises the full pipeline:

```text
HTTP Request
    ↓
Validation
    ↓
Rule-Based Analysis
    ↓
Gemini AI Analysis
    ↓
MongoDB Storage
    ↓
Response
```

## Deployment

The API is deployed on Render and uses environment variables for production configuration.

Production environment variables include:

```text
MONGODB_URI
GEMINI_API_KEY
```

## Purpose

This project is the first backend project in a larger job-search intelligence system.

The current version focuses on building the core job-description analysis pipeline that can later be extended into a larger application for job tracking, candidate-job matching, interview preparation, and career intelligence.
