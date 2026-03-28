import argparse
import os
import time

skills_list = [
    "Python", "SQL", "Machine Learning", "Deep Learning", "Docker", "Git",
    "Data Analysis", "Statistics", "Tableau", "Pandas", "NumPy",
    "Financial Modeling", "Accounting", "Risk Analysis", "Excel",
    "SEO", "Content Marketing", "Google Analytics",
    "Communication", "Leadership", "Project Management",
]

job_templates = [
    {"title": "Data Scientist", "skills": ["Python", "Machine Learning", "SQL"]},
    {"title": "Software Engineer", "skills": ["Python", "Docker", "Git"]},
    {"title": "Financial Analyst", "skills": ["Excel", "Financial Modeling", "Accounting"]},
    {"title": "Marketing Specialist", "skills": ["SEO", "Content Marketing", "Google Analytics"]},
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-n", "--resume_num", type=int, default=20)
    args = parser.parse_args()

    print(f"Resume ranking CLI - target {args.resume_num} resumes")
    start = time.perf_counter()
    end = time.perf_counter()
    print(f"Done in {end - start:.2f}s")


if __name__ == "__main__":
    main()
