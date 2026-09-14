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
    const normalizedText = normalizeText(text);
    const normalizedKeyword = normalizeText(keyword);

    if (
        normalizedKeyword === "c++" ||
        normalizedKeyword === "c#" ||
        normalizedKeyword === "node.js" ||
        normalizedKeyword === "express.js" ||
        normalizedKeyword === "react.js"
    ) {
        return normalizedText.includes(normalizedKeyword);
    }

    const escapedKeyword = normalizedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const regex = new RegExp(`\\b${escapedKeyword}\\b`, "i");

    return regex.test(normalizedText);
}


function findCanonicalSkill(skillInput) {
    const normalizedInput = normalizeText(skillInput);

    const skill = skills.find(skill =>
        skill.keywords.some(keyword =>
            normalizeText(keyword) === normalizedInput
        )
    );

    return skill ? skill.name : null;
}


function findSkillsInText(text) {
    return skills
        .filter(skill =>
            skill.keywords.some(keyword =>
                containsKeyword(text, keyword)
            )
        )
        .map(skill => skill.name);
}


function detectSkills(text) {
    return findSkillsInText(text);
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


/*
 * Split text into useful sentences.
 *
 * We avoid blindly splitting on every "." because
 * technology names such as Node.js contain periods.
 */
function splitSentences(text) {
    return text
        .replace(/\r?\n/g, " ")
        .split(/(?<=[!?])\s+|(?<=[a-z0-9)])\.\s+(?=[A-Z])/)
        .map(sentence => sentence.trim())
        .filter(Boolean);
}


/*
 * Extract sections when the JD explicitly contains headings
 * such as:
 *
 * Requirements:
 * Responsibilities:
 * Qualifications:
 */
function extractSection(text, headings) {
    for (const heading of headings) {
        const escapedHeading = heading.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const headingPattern = new RegExp(
            `\\b${escapedHeading}\\b\\s*:`,
            "i"
        );

        const match = text.match(headingPattern);

        if (!match) {
            continue;
        }

        const sectionStart =
            match.index + match[0].length;

        const remainingText =
            text.slice(sectionStart);

        const nextHeadingPattern =
            /\b(requirements|qualifications|responsibilities|what you'll do|what you will do|skills|preferred qualifications|preferred skills|nice to have|must have|required skills|about the role)\b\s*:/i;

        const nextHeadingMatch =
            remainingText.match(nextHeadingPattern);

        const section = nextHeadingMatch
            ? remainingText.slice(0, nextHeadingMatch.index)
            : remainingText;

        return section
            .split(/\r?\n|•/)
            .map(item => item.trim())
            .filter(item => item.length > 10)
            .slice(0, 10);
    }

    return [];
}


/*
 * Real JDs often don't use section headings.
 *
 * Example:
 * "Experience with REST APIs is required."
 * "Knowledge of PostgreSQL is preferred."
 *
 * We detect these sentences from their language.
 */
function extractImplicitRequirements(text) {
    const requirementPatterns = [
        /\brequired\b/i,
        /\bmust\b/i,
        /\bmust have\b/i,
        /\bshould have\b/i,
        /\bneed(?:ed|s)?\b/i,
        /\bessential\b/i,
        /\bmandatory\b/i,
        /\bexperience with\b/i,
        /\bexperience in\b/i,
        /\bknowledge of\b/i,
        /\bproficiency in\b/i,
        /\bfamiliarity with\b/i,
        /\bpreferred\b/i,
        /\bnice to have\b/i,
        /\bgood to have\b/i,
        /\bbonus\b/i
    ];

    const sentences = splitSentences(text);

    return sentences
        .filter(sentence =>
            requirementPatterns.some(pattern =>
                pattern.test(sentence)
            )
        )
        .filter(sentence =>
            findSkillsInText(sentence).length > 0 ||
            /\bexperience\b|\bknowledge\b|\bproficiency\b|\bfamiliarity\b/i.test(sentence)
        )
        .slice(0, 10);
}


/*
 * Detect responsibilities from action-oriented language.
 *
 * Example:
 * "Build and maintain scalable backend services."
 * "Design and implement REST APIs."
 */
function extractImplicitResponsibilities(text) {
    const responsibilityPatterns = [
        /\bresponsible for\b/i,
        /\bbuild\b/i,
        /\bdevelop\b/i,
        /\bdesign\b/i,
        /\bimplement\b/i,
        /\bmaintain\b/i,
        /\bcreate\b/i,
        /\bmanage\b/i,
        /\bdeploy\b/i,
        /\bdeveloping\b/i,
        /\bdesigning\b/i,
        /\bimplementing\b/i,
        /\bmaintaining\b/i,
        /\bcollaborate\b/i,
        /\bwork with\b/i
    ];

    const sentences = splitSentences(text);

    const requirementPatterns = [
        /\brequired\b/i,
        /\bmust have\b/i,
        /\bpreferred\b/i,
        /\bnice to have\b/i,
        /\bexperience with\b/i,
        /\bknowledge of\b/i
    ];

    return sentences
        .filter(sentence =>
            responsibilityPatterns.some(pattern =>
                pattern.test(sentence)
            )
        )
        .filter(sentence =>
            !requirementPatterns.some(pattern =>
                pattern.test(sentence)
            )
        )
        .filter(sentence => sentence.length > 15)
        .slice(0, 10);
}


function detectSkillImportance(jobDescription) {
    const requiredPatterns = [
        /\brequired\b/i,
        /\bmust have\b/i,
        /\bmust-have\b/i,
        /\bshould have\b/i,
        /\bneed(?:ed|s)?\b/i,
        /\bessential\b/i,
        /\bmandatory\b/i,
        /\bexperience with\b/i,
        /\bexperience in\b/i,
        /\bknowledge of\b/i,
        /\bproficiency in\b/i
    ];

    const preferredPatterns = [
        /\bpreferred\b/i,
        /\bnice to have\b/i,
        /\bnice-to-have\b/i,
        /\bgood to have\b/i,
        /\bgood-to-have\b/i,
        /\bbonus\b/i,
        /\bis a plus\b/i,
        /\bplus\b/i
    ];

    const requiredHeadings = [
        "requirements",
        "required skills",
        "required qualifications",
        "qualifications",
        "must have"
    ];

    const preferredHeadings = [
        "preferred",
        "preferred skills",
        "preferred qualifications",
        "nice to have",
        "good to have",
        "bonus"
    ];

    const requiredSkills = new Set();
    const preferredSkills = new Set();

    const lines = jobDescription
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    let currentSection = "unknown";

    for (const line of lines) {
        const normalizedLine = normalizeText(line);

        if (
            requiredHeadings.some(heading =>
                normalizedLine === normalizeText(heading) ||
                normalizedLine.startsWith(
                    `${normalizeText(heading)}:`
                )
            )
        ) {
            currentSection = "required";
            continue;
        }

        if (
            preferredHeadings.some(heading =>
                normalizedLine === normalizeText(heading) ||
                normalizedLine.startsWith(
                    `${normalizeText(heading)}:`
                )
            )
        ) {
            currentSection = "preferred";
            continue;
        }

        const sentences = splitSentences(line);

        for (const sentence of sentences) {
            const detectedSkills =
                findSkillsInText(sentence);

            if (detectedSkills.length === 0) {
                continue;
            }

            const isRequired =
                requiredPatterns.some(pattern =>
                    pattern.test(sentence)
                );

            const isPreferred =
                preferredPatterns.some(pattern =>
                    pattern.test(sentence)
                );

            if (isPreferred) {
                for (const skill of detectedSkills) {
                    if (!requiredSkills.has(skill)) {
                        preferredSkills.add(skill);
                    }
                }

                continue;
            }
            
            if (isRequired) {
                for (const skill of detectedSkills) {
                    requiredSkills.add(skill);
                    preferredSkills.delete(skill);
                }

                continue;
            }
            
            for (const skill of detectedSkills) {
                if (currentSection === "required") {
                    requiredSkills.add(skill);
                    preferredSkills.delete(skill);
                }

                if (
                    currentSection === "preferred" &&
                    !requiredSkills.has(skill)
                ) {
                    preferredSkills.add(skill);
                }
            }
        }
    }

    return {
        requiredSkills: [...requiredSkills],
        preferredSkills: [...preferredSkills]
    };
}


function calculateFlatMatchScore(
    jobSkills,
    candidateSkills
) {
    if (jobSkills.length === 0) {
        return 0;
    }

    const matchedSkills = jobSkills.filter(skill =>
        candidateSkills.includes(skill)
    );

    return Math.round(
        (matchedSkills.length / jobSkills.length) * 100
    );
}


function calculateWeightedMatchScore(
    requiredSkills,
    preferredSkills,
    candidateSkills,
    allJobSkills
) {
    if (!candidateSkills || candidateSkills.length === 0) {
        return null;
    }

    if (
        requiredSkills.length === 0 &&
        preferredSkills.length === 0
    ) {
        return calculateFlatMatchScore(
            allJobSkills,
            candidateSkills
        );
    }

    const requiredWeight = 2;
    const preferredWeight = 1;

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const skill of requiredSkills) {
        totalWeight += requiredWeight;

        if (candidateSkills.includes(skill)) {
            matchedWeight += requiredWeight;
        }
    }

    for (const skill of preferredSkills) {
        totalWeight += preferredWeight;

        if (candidateSkills.includes(skill)) {
            matchedWeight += preferredWeight;
        }
    }

    if (totalWeight === 0) {
        return 0;
    }

    return Math.round(
        (matchedWeight / totalWeight) * 100
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

    const explicitRequirements = extractSection(
        jobDescription,
        [
            "requirements",
            "qualifications",
            "required skills"
        ]
    );

    const explicitResponsibilities = extractSection(
        jobDescription,
        [
            "responsibilities",
            "what you'll do",
            "what you will do"
        ]
    );

    const requirements =
        explicitRequirements.length > 0
            ? explicitRequirements
            : extractImplicitRequirements(jobDescription);

    const responsibilities =
        explicitResponsibilities.length > 0
            ? explicitResponsibilities
            : extractImplicitResponsibilities(jobDescription);

    const normalizedCandidateSkills = [
        ...new Set(
            candidateSkills
                .map(skill => findCanonicalSkill(skill))
                .filter(skill => skill !== null)
        )
    ];

    const skillImportance =
        detectSkillImportance(jobDescription);

    const explicitlyClassifiedSkills = new Set([
        ...skillImportance.requiredSkills,
        ...skillImportance.preferredSkills
    ]);

    const unclassifiedSkills = foundSkills.filter(
        skill =>
            !explicitlyClassifiedSkills.has(skill)
    );

    const matchedSkills = foundSkills.filter(skill =>
        normalizedCandidateSkills.includes(skill)
    );

    const missingSkills = foundSkills.filter(skill =>
        !matchedSkills.includes(skill)
    );

    const matchScore =
        calculateWeightedMatchScore(
            skillImportance.requiredSkills,
            skillImportance.preferredSkills,
            normalizedCandidateSkills,
            foundSkills
        );

    return {
        role: foundRole,
        skills: foundSkills,
        experience,

        requiredSkills:
            skillImportance.requiredSkills,

        preferredSkills:
            skillImportance.preferredSkills,

        unclassifiedSkills,

        candidateSkills:
            normalizedCandidateSkills,

        matchedSkills,
        missingSkills,

        matchScore,

        requirements,
        responsibilities
    };
}