import {
    skills,
    roles
} from "../data/skillData.js";


function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s+#.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function containsKeyword(text, keyword) {
    const normalizedKeyword = normalizeText(keyword);

    if (
        normalizedKeyword === "c++" ||
        normalizedKeyword === "c#" ||
        normalizedKeyword === "node.js" ||
        normalizedKeyword === "express.js" ||
        normalizedKeyword === "react.js"
    ) {
        return text.includes(normalizedKeyword);
    }

    const escapedKeyword = normalizedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const regex = new RegExp(`\\b${escapedKeyword}\\b`, "i");

    return regex.test(text);
}


function detectSkills(text) {
    return skills
        .filter(skill =>
            skill.keywords.some(keyword =>
                containsKeyword(text, keyword)
            )
        )
        .map(skill => skill.name);
}


function detectRole(text) {
    const role = roles.find(role =>
        role.keywords.some(keyword =>
            containsKeyword(text, keyword)
        )
    );

    return role ? role.name : null;
}


function detectExperience(text) {
    const patterns = [
        /\b(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience\b/i,
        /\bminimum\s*(?:of\s*)?(\d+)\s*(?:years?|yrs?)\b/i,
        /\bat least\s*(\d+)\s*(?:years?|yrs?)\b/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match) {
            return `${match[1]} years`;
        }
    }

    if (
        /\bfresher\b|\bentry[- ]level\b|\bno experience\b/i.test(text)
    ) {
        return "Fresher / Entry Level";
    }

    return null;
}


function extractSection(text, headings) {
    const normalizedText = text.toLowerCase();

    for (const heading of headings) {
        const headingIndex = normalizedText.indexOf(heading);

        if (headingIndex === -1) {
            continue;
        }

        const sectionStart = headingIndex + heading.length;

        const remainingText = text.slice(sectionStart);

        const nextSectionMatch = remainingText.match(
            /\n\s*(requirements|qualifications|responsibilities|what you'll do|what you will do|skills|preferred qualifications|nice to have)\s*:?\s*\n?/i
        );

        const section = nextSectionMatch
            ? remainingText.slice(0, nextSectionMatch.index)
            : remainingText;

        return section
            .split(/\n|•/)
            .map(item => item.trim())
            .filter(item => item.length > 10)
            .slice(0, 10);
    }

    return [];
}


function calculateMatchScore(jobSkills, candidateSkills) {
    if (!candidateSkills || candidateSkills.length === 0) {
        return null;
    }

    const normalizedCandidateSkills = candidateSkills.map(skill =>
        normalizeText(skill)
    );

    const matchedSkills = jobSkills.filter(skill =>
        normalizedCandidateSkills.includes(normalizeText(skill))
    );

    if (jobSkills.length === 0) {
        return 0;
    }

    return Math.round(
        (matchedSkills.length / jobSkills.length) * 100
    );
}


export function analyzeJobDescription(
    jobDescription,
    candidateSkills = []
) {
    const text = normalizeText(jobDescription);

    const foundSkills = detectSkills(text);

    const foundRole = detectRole(text);

    const experience = detectExperience(text);

    const requirements = extractSection(
        jobDescription,
        [
            "requirements",
            "qualifications",
            "required skills"
        ]
    );

    const responsibilities = extractSection(
        jobDescription,
        [
            "responsibilities",
            "what you'll do",
            "what you will do"
        ]
    );

    const matchedSkills = foundSkills.filter(skill =>
        candidateSkills.some(candidateSkill =>
            normalizeText(candidateSkill) === normalizeText(skill)
        )
    );

    const missingSkills = foundSkills.filter(skill =>
        !matchedSkills.includes(skill)
    );

    const matchScore = calculateMatchScore(
        foundSkills,
        candidateSkills
    );

    return {
        role: foundRole,
        skills: foundSkills,
        experience,
        missingSkills,
        matchScore,
        requirements,
        responsibilities,
        matchedSkills
    };
}