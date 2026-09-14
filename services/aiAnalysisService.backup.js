import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function analyzeWithAI(
    jobDescription,
    candidateSkills = []
) {
    const prompt = `
You are a job-description analysis assistant.

Analyze the following job description and candidate skills.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE SKILLS:
${candidateSkills.join(", ") || "None provided"}

Return ONLY valid JSON in exactly this structure:

{
  "summary": "Short summary of what the employer is looking for",
  "seniority": "Fresher / Junior / Mid-level / Senior / Unknown",
  "keySkills": ["skill1", "skill2"],
  "skillGaps": ["skill1", "skill2"],
  "candidateStrengths": ["strength1", "strength2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "interviewTopics": ["topic1", "topic2"]
}

Rules:
- Do not invent information that is not reasonably supported by the job description.
- Keep the output concise and useful.
- keySkills should contain the most important technical skills mentioned or clearly implied.
- skillGaps should contain important skills from the job description that are not present in the candidate skills.
- candidateStrengths should only be based on the provided candidate skills.
- recommendations should be practical actions for the candidate.
- interviewTopics should contain likely technical areas to prepare.
`;

    const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt
    });

    const text = interaction.output_text.trim();

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("AI returned invalid JSON:", text);
        throw new Error("AI returned an invalid analysis format");
    }
}