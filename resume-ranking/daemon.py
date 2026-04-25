import os
import time
import json
from pathlib import Path
from watchfiles import watch
from resume_parser import parse_resume, parse_job
from resume_ranking import rank_resumes


WATCH_DIR = Path(os.environ.get("WATCH_DIR", "uploads"))
RESULT_DIR = Path(os.environ.get("RESULT_DIR", "ranking_results"))
LOG_FILE = Path("daemon.log")


def log(msg):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}\n"
    print(line, end="")
    with LOG_FILE.open("a") as f:
        f.write(line)


def process_upload(file_path):
    try:
        log(f"Processing {file_path}")
        parsed = parse_resume(str(file_path))

        job_path = WATCH_DIR / "current_job.json"
        if not job_path.exists():
            log(f"No current_job.json, skip ranking")
            return

        with job_path.open() as f:
            job = json.load(f)

        results = rank_resumes(job, [parsed])
        out = RESULT_DIR / f"{file_path.stem}.json"
        out.parent.mkdir(parents=True, exist_ok=True)

        with out.open("w") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        log(f"Done {out}")
    except Exception as e:
        log(f"Error processing {file_path}: {e}")


def main():
    WATCH_DIR.mkdir(parents=True, exist_ok=True)
    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    log(f"Watching {WATCH_DIR.resolve()}")

    for changes in watch(WATCH_DIR):
        for change_type, path_str in changes:
            path = Path(path_str)
            if path.suffix.lower() not in {".pdf", ".docx"}:
                continue
            if str(change_type) == "Change.added":
                process_upload(path)


if __name__ == "__main__":
    main()
