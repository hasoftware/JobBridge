const SKILL_DICTIONARY = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Ruby", "PHP",
    "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "Spring",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP",
    "Git", "CI/CD", "Linux", "REST API", "GraphQL", "HTML", "CSS", "Tailwind",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
    "Excel", "Power BI", "Tableau", "SQL",
    "Photoshop", "Illustrator", "Figma",
    "SEO", "Content Marketing", "Google Analytics",
    "Communication", "Leadership", "Project Management", "Agile", "Scrum",
]

function normalize(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function extractSkills(text) {
    if (!text || typeof text !== "string") return []
    const lower = normalize(text)
    const found = new Set()

    for (const skill of SKILL_DICTIONARY) {
        const pattern = new RegExp(`(^|[^a-z0-9])${normalize(skill).replace(/[.+]/g, "\\$&")}([^a-z0-9]|$)`)
        if (pattern.test(lower)) {
            found.add(skill)
        }
    }

    return Array.from(found)
}

function extractSkillsBatch(texts) {
    if (!texts || texts.length === 0) return []
    return texts.map((t) => extractSkills(t))
}

module.exports = { extractSkills, extractSkillsBatch, SKILL_DICTIONARY }
