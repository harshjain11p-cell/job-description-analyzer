import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const aiAnalysisSchema = {
    type: "object",
    properties: {
        summary: {
            type: "string"
        },
        seniority: {
            type: "string",
            enum: [
                "Fresher",
                "Junior",
                "Mid-level",
                "Senior",
                "Unknown"
            ]
        },
        keySkills: {
            type: "array",
            items: {
                type: "string"
            }
        },
        skillGaps: {
            type: "array",
            items: {
                type: "string"
            }
        },
        candidateStrengths: {
            type: "array",
            items: {
                type: "string"
            }
        },
        recommendations: {
            type: "array",
            items: {
                type: "string"
            }
        },
        interviewTopics: {
            type: "array",
            items: {
                type: "string"
            }
        }
    },
    required: [
        "summary",
        "seniority",
        "keySkills",
        "skillGaps",
        "candidateStrengths",
        "recommendations",
        "interviewTopics"
    ]
};

export async function analyzeWithAI(
    jobDescription,
    candidateSkills = [],
    ruleBasedResult = {}
) {
    const prompt = `
You are a job-description analysis assistant.

Analyze the job description using the deterministic analysis already performed by our backend.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE SKILLS:
${candidateSkills.join(", ") || "None provided"}

DETERMINISTIC BACKEND ANALYSIS:
Role: ${ruleBasedResult.role || "Unknown"}
Experience: ${ruleBasedResult.experience || "Unknown"}
Required Skills: ${ruleBasedResult.requiredSkills?.join(", ") || "None"}
Preferred Skills: ${ruleBasedResult.preferredSkills?.join(", ") || "None"}
Matched Skills: ${ruleBasedResult.matchedSkills?.join(", ") || "None"}
Missing Skills: ${ruleBasedResult.missingSkills?.join(", ") || "None"}
Match Score: ${ruleBasedResult.matchScore ?? "Unknown"}

Rules:
- Treat the deterministic backend analysis as the source of truth for skills, matches, missing skills, role, experience, and match score. When referring to the role, use the deterministic role exactly as provided. Do not rename, expand, or modify it.- Do not contradict the deterministic analysis.
- Do not mark a preferred skill as required.
- Do not invent skills or requirements.
- keySkills should focus on important skills already identified by the backend.
- skillGaps should be based primarily on the backend missingSkills.
- candidateStrengths should be based on matchedSkills and candidateSkills.
- recommendations should address the actual skill gaps.
- interviewTopics should focus on relevant technical areas from the job description and identified skills.
- Keep the analysis concise and useful.
- seniority should be inferred carefully from the job description and experience requirement.
`;

    const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
        response_format: {
            type: "text",
            mime_type: "application/json",
            schema: aiAnalysisSchema
        }
    });

    const text = interaction.output_text.trim();

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("AI returned invalid JSON:", text);
        throw new Error("AI returned an invalid analysis format");
    }
}