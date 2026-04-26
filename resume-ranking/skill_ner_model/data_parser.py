import json
import spacy
from pathlib import Path
from spacy.tokens import DocBin


def load_skills_dictionary(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


def annotate_text(text, skills):
    text_lower = text.lower()
    entities = []
    for skill in skills:
        skill_lower = skill.lower()
        start = text_lower.find(skill_lower)
        while start != -1:
            entities.append((start, start + len(skill), "SKILL"))
            start = text_lower.find(skill_lower, start + 1)
    entities.sort()

    cleaned = []
    last_end = -1
    for start, end, label in entities:
        if start >= last_end:
            cleaned.append((start, end, label))
            last_end = end
    return cleaned


def to_spacy(json_path, skills_path, out_path):
    skills = load_skills_dictionary(skills_path)
    nlp = spacy.blank("en")
    db = DocBin()

    with open(json_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    for record in records:
        text = record.get("text", "")
        ents = annotate_text(text, skills)
        doc = nlp.make_doc(text)
        spans = [doc.char_span(s, e, label=l) for s, e, l in ents]
        spans = [span for span in spans if span is not None]
        doc.ents = spans
        db.add(doc)

    db.to_disk(out_path)
    print(f"Wrote {len(records)} docs to {out_path}")


if __name__ == "__main__":
    base = Path(__file__).parent
    for split in ["train", "dev", "test"]:
        to_spacy(
            base / "data" / f"{split}.json",
            base / "skills_dictionary.txt",
            base / "data" / f"{split}.spacy",
        )
