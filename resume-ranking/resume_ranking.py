import math
import re
from collections import Counter
from multiprocessing.connection import Listener


def tokenize(text):
    if not text:
        return []
    return re.findall(r"[a-zA-Z]+", text.lower())


def tf(tokens):
    counts = Counter(tokens)
    total = len(tokens) or 1
    return {term: count / total for term, count in counts.items()}


def idf(documents):
    n = len(documents)
    df = Counter()
    for doc in documents:
        for term in set(doc):
            df[term] += 1
    return {term: math.log((n + 1) / (count + 1)) + 1 for term, count in df.items()}


def tfidf_vector(tokens, idf_map):
    return {term: tf_val * idf_map.get(term, 0) for term, tf_val in tf(tokens).items()}


def cosine(vec1, vec2):
    common = set(vec1) & set(vec2)
    dot = sum(vec1[t] * vec2[t] for t in common)
    n1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    n2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    if n1 == 0 or n2 == 0:
        return 0.0
    return dot / (n1 * n2)


def skill_match(job_skills, resume_skills):
    if not job_skills:
        return 0.0
    job_set = set(s.lower() for s in job_skills)
    resume_set = set(s.lower() for s in resume_skills)
    matched = job_set & resume_set
    return len(matched) / len(job_set)


def rank_resumes(job, resumes):
    job_tokens = tokenize(job.get("text", ""))
    job_skills = job.get("skills", [])

    resume_tokens_list = [tokenize(r.get("text", "")) for r in resumes]
    all_docs = [job_tokens] + resume_tokens_list
    idf_map = idf(all_docs)
    job_vec = tfidf_vector(job_tokens, idf_map)

    results = []
    for resume, tokens in zip(resumes, resume_tokens_list):
        text_score = cosine(job_vec, tfidf_vector(tokens, idf_map))
        skill_score = skill_match(job_skills, resume.get("skills", []))
        combined = 0.5 * text_score + 0.5 * skill_score
        results.append({
            "name": resume.get("name", ""),
            "skills": resume.get("skills", []),
            "score": round(combined, 4),
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results


def serve(host="localhost", port=8000):
    listener = Listener((host, port))
    print(f"Ranking daemon listening on {host}:{port}")
    while True:
        conn = listener.accept()
        try:
            payload = conn.recv()
            ranking = rank_resumes(payload.get("job", {}), payload.get("resumes", []))
            conn.send(ranking)
        except Exception as e:
            conn.send({"error": str(e)})
        finally:
            conn.close()


if __name__ == "__main__":
    serve()
