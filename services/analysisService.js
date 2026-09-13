import {
    skills,
    roles,
    experiencePatterns
} from "../data/skillData.js";

export function analyzeJobDescription(jobDescription) {

    const text = jobDescription
        .toLowerCase()
        .trim();

    const foundSkills = skills
        .filter(skill =>
            skill.keywords.some(keyword =>
                text.includes(keyword)
            )
        )
        .map(skill => skill.name);

    const foundRole = roles.find(role =>
        role.keywords.some(keyword =>
            text.includes(keyword)
        )
    );

    const foundExperience = experiencePatterns.find(experience =>
        text.includes(experience.toLowerCase())
    );

    const missingSkills = skills
        .filter(skill =>
            !foundSkills.includes(skill.name)
        )
        .map(skill => skill.name);

    const matchScore = Math.round(
        (foundSkills.length / skills.length) * 100
    );

    return {
        role: foundRole ? foundRole.name : null,
        skills: foundSkills,
        experience: foundExperience || null,
        missingSkills,
        matchScore
    };
}