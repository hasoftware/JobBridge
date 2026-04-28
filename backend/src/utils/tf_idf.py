from dataclasses import dataclass
from datetime import UTC, datetime
import random
import sys
from typing import List, Set, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

@dataclass
class UserProfile:
    id: int
    profile_description: str
    search_queries: List[str]
    applied_titles: List[str]

@dataclass
class Job:
    id: int
    title: str
    skills: List[str]
    description: str
    location: str
    posted_at: datetime
    is_active: bool = True

def build_user_text(user: UserProfile) -> str:
    return f"""
    profile: {user.profile_description}
    recent_searches: {' '.join(user.search_queries)}
    applied_jobs: {' '.join(user.applied_titles)}
    """

def build_job_text(job: Job) -> str:
    return f"""
    title: {job.title}
    skills: {' '.join(job.skills)}
    description: {job.description}
    location: {job.location}
    """

def freshness_adjustment(score: float, job: Job) -> float:
    posted_at = job.posted_at if job.posted_at.tzinfo else job.posted_at.replace(tzinfo=UTC)
    age_days = (datetime.now(UTC) - posted_at).days

    if age_days <= 3:
        score += 0.05
    elif age_days > 30:
        score -= 0.05

    return score

def recommend_jobs_tfidf(
    user: UserProfile,
    jobs: List[Job],
    applied_job_ids: Set[int],
    top_k: int = 10
    ) -> List[Tuple[int, float]]:

    valid_jobs = [
        job for job in jobs
        if job.is_active and job.id not in applied_job_ids
    ]

    if not valid_jobs:
        return []

    user_text = build_user_text(user)
    job_texts = [build_job_text(job) for job in valid_jobs]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2)
    )

    corpus = [user_text] + job_texts
    tfidf_matrix = vectorizer.fit_transform(corpus)

    user_vec = tfidf_matrix[0]
    job_vecs = tfidf_matrix[1:]

    scores = cosine_similarity(user_vec, job_vecs)[0]

    adjusted_scores = []
    for i, job in enumerate(valid_jobs):
        score = float(scores[i])
        score = freshness_adjustment(score, job)
        adjusted_scores.append((job.id, round(score, 4)))

    adjusted_scores.sort(key=lambda x: x[1], reverse=True)

    return adjusted_scores[:top_k]

def inspect_tfidf_vectors(user: UserProfile, jobs: List[Job]) -> None:
    user_text = build_user_text(user)
    job_texts = [build_job_text(job) for job in jobs]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 3)
    )

    documents = [("user", user_text)] + [
        (f"job_{job.id}", text) for job, text in zip(jobs, job_texts)
    ]
    tfidf_matrix = vectorizer.fit_transform([text for _, text in documents])
    feature_names = vectorizer.get_feature_names_out()

    print("\nVocabulary:")
    for i, term in enumerate(feature_names):
        print(f"{i}: {term}")

    print("\nNon-zero TF-IDF weights by document:")
    for row_index, (label, _) in enumerate(documents):
        row = tfidf_matrix[row_index]
        pairs = sorted(
            zip(row.indices, row.data),
            key=lambda item: item[1],
            reverse=True
        )
        print(f"\n{label}:")
        for feature_index, weight in pairs:
            print(f"  {feature_names[feature_index]} = {weight:.4f}")

def run_synthetic_benchmark(
    num_candidates: int = 20,
    num_jobs: int = 50,
    top_k: int = 5,
    seed: int = 42
) -> None:
    random.seed(seed)

    skill_pool = [
        "python", "sql", "docker", "fastapi", "django", "react", "javascript", "typescript",
        "aws", "gcp", "kubernetes", "postgresql", "mongodb", "machine learning", "pandas",
        "data analysis", "etl", "spark", "nodejs", "java", "spring", "golang", "redis", "api"
    ]
    title_templates = [
        "Backend Engineer", "Data Analyst", "ML Engineer", "Frontend Developer", "Full Stack Engineer",
        "Platform Engineer", "Data Engineer", "Software Engineer", "DevOps Engineer", "Python Developer"
    ]
    job_desc_bits = [
        "build APIs", "maintain microservices", "develop dashboards", "work on ETL pipelines",
        "deploy cloud infrastructure", "improve recommendation systems", "build web applications",
        "optimize SQL queries", "create data pipelines", "ship frontend features"
    ]
    search_queries_pool = [
        "python backend", "remote developer", "data engineer", "ml jobs", "cloud infrastructure",
        "frontend react", "etl pipelines", "sql analyst", "fastapi engineer", "devops kubernetes"
    ]
    locations = ["remote", "bangkok", "ho chi minh city", "singapore", "hybrid"]

    def sample_skills(min_n: int = 3, max_n: int = 6) -> List[str]:
        return random.sample(skill_pool, random.randint(min_n, max_n))

    candidates = []
    for i in range(num_candidates):
        skills = sample_skills()
        description = (
            f"Candidate {i + 1} experienced in "
            + ", ".join(skills)
            + " with focus on "
            + random.choice(job_desc_bits)
        )
        candidates.append(UserProfile(
            id=i + 1,
            profile_description=description,
            search_queries=random.sample(search_queries_pool, 2),
            applied_titles=random.sample(title_templates, 2),
        ))

    jobs = []
    for j in range(num_jobs):
        skills = sample_skills()
        jobs.append(Job(
            id=1000 + j,
            title=random.choice(title_templates),
            skills=skills,
            description=random.choice(job_desc_bits) + " using " + ", ".join(skills[:3]),
            location=random.choice(locations),
            posted_at=datetime.now(UTC).replace(microsecond=0),
            is_active=random.random() > 0.1,
        ))

    print(
        f"Synthetic benchmark: candidates={len(candidates)} "
        f"jobs={len(jobs)} active_jobs={sum(job.is_active for job in jobs)}"
    )

    all_lengths = []
    all_top_scores = []
    job_ids = [job.id for job in jobs]
    job_lookup = {job.id: job for job in jobs}
    max_applied_jobs = min(5, max(0, len(job_ids) - 1))

    for candidate in candidates:
        applied_job_ids = set(random.sample(job_ids, max_applied_jobs))
        recs = recommend_jobs_tfidf(candidate, jobs, applied_job_ids, top_k=top_k)
        all_lengths.append(len(recs))
        if recs:
            all_top_scores.append(recs[0][1])
        print(f"\nCandidate {candidate.id}")
        print(f"  profile_description: {candidate.profile_description}")
        print(f"  search_queries: {', '.join(candidate.search_queries)}")
        print(f"  applied_titles: {', '.join(candidate.applied_titles)}")
        print(f"  applied_job_ids: {sorted(applied_job_ids)}")
        print("  recommended_jobs:")
        if not recs:
            print("    none")
            continue
        for rank, (job_id, score) in enumerate(recs, start=1):
            job = job_lookup[job_id]
            print(
                f"    {rank}. id={job.id} score={score:.4f} title={job.title} "
                f"location={job.location} active={job.is_active}"
            )
            print(f"       skills: {', '.join(job.skills)}")
            print(f"       description: {job.description}")

    print("summary:")
    print(f"  min recommendations returned = {min(all_lengths) if all_lengths else 0}")
    print(f"  max recommendations returned = {max(all_lengths) if all_lengths else 0}")
    if all_top_scores:
        print(f"  avg top score = {sum(all_top_scores) / len(all_top_scores):.4f}")
        print(f"  max top score = {max(all_top_scores):.4f}")
        print(f"  min top score = {min(all_top_scores):.4f}")

def parse_benchmark_args(argv: List[str]) -> Tuple[int, int, int]:
    if len(argv) >= 3:
        return int(argv[0]), int(argv[1]), int(argv[2])
    if len(argv) == 2:
        return int(argv[0]), int(argv[1]), 5
    return 20, 50, 5

if __name__ == '__main__':
    from datetime import timedelta

    if len(sys.argv) > 1 and sys.argv[1] == "benchmark":
        num_candidates, num_jobs, top_k = parse_benchmark_args(sys.argv[2:])
        run_synthetic_benchmark(num_candidates=num_candidates, num_jobs=num_jobs, top_k=top_k)
        raise SystemExit(0)

    user = UserProfile(
        id=1,
        profile_description="backend engineer with python, sql, and docker working on APIs and microservices",
        search_queries=["python backend", "remote developer"],
        applied_titles=["backend engineer", "python developer"]
    )

    jobs = [
        Job(
            id=101,
            title="Python Backend Engineer",
            skills=["python", "docker", "postgresql"],
            description="Build APIs using FastAPI and microservices architecture",
            location="remote",
            posted_at=datetime.now(UTC) - timedelta(days=2),
        ),
        Job(
            id=102,
            title="Frontend React Developer",
            skills=["javascript", "react", "css"],
            description="Build UI using React",
            location="remote",
            posted_at=datetime.now(UTC) - timedelta(days=1),
        ),
        Job(
            id=103,
            title="Data Analyst",
            skills=["sql", "excel"],
            description="Analyze data and build dashboards",
            location="ho chi minh city",
            posted_at=datetime.now(UTC) - timedelta(days=10),
        ),
    ]

    applied_job_ids = {103}

    recommendations = recommend_jobs_tfidf(
        user,
        jobs,
        applied_job_ids,
        top_k=5
    )

    inspect_tfidf_vectors(user, jobs)
    print("Recommended jobs:", recommendations)

