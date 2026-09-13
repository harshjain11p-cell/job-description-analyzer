import {
    skills,
    roles,
    experiencePatterns
} from "../data/skillData.js";


function extractSection(text, headings) {

    for (const heading of headings) {

        const startIndex = text.indexOf(heading);

        if (startIndex === -1) {
            continue;
        }

        const sectionStart = startIndex + heading.length;

        const remainingText = text.slice(sectionStart);

        const nextSection = remainingText.search(
            /\b(requirements|qualifications|responsibilities|what you'll do|what you will do|skills)\b/i
        );

        const section = nextSection === -1
            ? remainingText
            : remainingText.slice(0, nextSection);

        return section
            .split(/\n|•|-/)
            .map(item => item.trim())
            .filter(item => item.length > 10);
    }

    return [];
}


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


    const requirements = extractSection(
        text,
        [
            "requirements",
            "qualifications",
            "required skills"
        ]
    );


    const responsibilities = extractSection(
        text,
        [
            "responsibilities",
            "what you'll do",
            "what you will do"
        ]
    );


    return {
        role: foundRole ? foundRole.name : null,
        skills: foundSkills,
        experience: foundExperience || null,
        missingSkills,
        matchScore,
        requirements,
        responsibilities
    };
}