import os
import random
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


SKILLS_POOL = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Ruby",
    "React", "Vue", "Angular", "Node.js", "Django", "Flask",
    "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "Docker", "Kubernetes", "AWS", "GCP",
    "Git", "Linux", "REST API", "GraphQL",
    "Machine Learning", "TensorFlow", "Pandas", "NumPy",
    "Excel", "Tableau", "SQL",
    "Communication", "Leadership", "Project Management",
]

POSITIONS = [
    "Frontend Developer", "Backend Engineer", "Full-stack Developer",
    "Data Analyst", "Data Scientist", "DevOps Engineer",
    "Mobile Developer", "Product Manager", "QA Engineer",
]

NAMES = [
    "Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D",
    "Hoang Van E", "Vu Thi F", "Dang Van G", "Bui Thi H",
]


def generate_resume(idx, out_dir):
    name = random.choice(NAMES) + f" #{idx}"
    position = random.choice(POSITIONS)
    skills = random.sample(SKILLS_POOL, k=random.randint(5, 10))
    years = random.randint(1, 8)

    out = Path(out_dir) / f"resume_{idx}.pdf"
    out.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(str(out), pagesize=A4)

    story = [
        Paragraph(f"<b>{name}</b>", styles["Title"]),
        Paragraph(position, styles["Heading2"]),
        Spacer(1, 12),
        Paragraph(f"<b>Experience:</b> {years} years", styles["Normal"]),
        Spacer(1, 8),
        Paragraph("<b>Skills:</b> " + ", ".join(skills), styles["Normal"]),
        Spacer(1, 8),
        Paragraph(
            f"Experienced {position.lower()} with {years} years working on production systems. "
            f"Strong background in {skills[0]} and {skills[1]}. "
            f"Familiar with {', '.join(skills[2:5])}.",
            styles["Normal"],
        ),
    ]
    doc.build(story)
    return out


def resume_generator(n):
    out_dir = Path("resumes")
    out_dir.mkdir(parents=True, exist_ok=True)

    for i in range(1, n + 1):
        path = generate_resume(i, out_dir)
        if i % 50 == 0:
            print(f"Generated {i}/{n}")

    print(f"Done. Wrote {n} resumes to {out_dir.resolve()}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-n", "--num", type=int, default=20)
    args = parser.parse_args()
    resume_generator(args.num)
