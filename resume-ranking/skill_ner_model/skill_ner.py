import spacy
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "model-best"

_nlp = None


def get_model():
    global _nlp
    if _nlp is None:
        if not MODEL_DIR.exists():
            raise FileNotFoundError(f"Trained model not found at {MODEL_DIR}. Run spacy train first.")
        _nlp = spacy.load(str(MODEL_DIR))
    return _nlp


def extract_skills(text):
    if not text:
        return []
    doc = get_model()(text)
    skills = set()
    for ent in doc.ents:
        if ent.label_ == "SKILL":
            skills.add(ent.text.strip())
    return sorted(skills)


def extract_skills_batch(texts):
    return [extract_skills(t) for t in texts]


if __name__ == "__main__":
    import sys
    sample = " ".join(sys.argv[1:]) or "Experienced React developer with Python and SQL background."
    print(extract_skills(sample))
