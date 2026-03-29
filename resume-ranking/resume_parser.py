import re
import pdfplumber


def parse_resume(file_path):
    text = extract_text(file_path)
    return {
        "file": file_path,
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "raw": text,
    }


def parse_resumes(file_paths):
    return [parse_resume(p) for p in file_paths]


def parse_job(text):
    return {
        "title": extract_title(text),
        "skills": extract_skills(text),
        "raw": text,
    }


def load_models():
    pass


def extract_text(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_name(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return lines[0] if lines else ""


def extract_email(text):
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else ""


def extract_phone(text):
    match = re.search(r"\+?\d[\d\s\-\(\)]{8,}\d", text)
    return match.group(0) if match else ""


def extract_skills(text):
    common = ["Python", "SQL", "Machine Learning", "Docker", "Git",
              "JavaScript", "React", "Node.js", "Excel", "SEO"]
    found = []
    text_lower = text.lower()
    for skill in common:
        if skill.lower() in text_lower:
            found.append(skill)
    return found


def extract_title(text):
    match = re.search(r"Title:\s*(.+)", text)
    return match.group(1).strip() if match else ""
