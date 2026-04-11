import math
import re
from collections import Counter


def tokenize(text):
    if not text:
        return []
    return re.findall(r"[a-zA-Z]+", text.lower())


def term_frequency(tokens):
    counts = Counter(tokens)
    total = len(tokens)
    if total == 0:
        return {}
    return {term: count / total for term, count in counts.items()}


def inverse_document_frequency(documents):
    n = len(documents)
    df = Counter()
    for doc in documents:
        for term in set(doc):
            df[term] += 1
    return {term: math.log((n + 1) / (count + 1)) + 1 for term, count in df.items()}


def tfidf_vector(tokens, idf):
    tf = term_frequency(tokens)
    return {term: tf_val * idf.get(term, 0) for term, tf_val in tf.items()}


def cosine_similarity(vec1, vec2):
    common = set(vec1) & set(vec2)
    dot = sum(vec1[t] * vec2[t] for t in common)
    norm1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    norm2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def score_resumes(job_text, resume_texts):
    job_tokens = tokenize(job_text)
    resume_tokens_list = [tokenize(t) for t in resume_texts]

    all_docs = [job_tokens] + resume_tokens_list
    idf = inverse_document_frequency(all_docs)

    job_vec = tfidf_vector(job_tokens, idf)
    return [cosine_similarity(job_vec, tfidf_vector(r, idf)) for r in resume_tokens_list]
