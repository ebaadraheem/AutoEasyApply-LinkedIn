# AutoEasyApply (LinkedIn)

A Python + Selenium bot that automates LinkedIn's "Easy Apply" flow: it logs into LinkedIn, searches for jobs matching your configured keywords/filters, and submits Easy Apply applications on your behalf — choosing a resume, answering common application questions from a pre-filled answer bank, and stepping through multi-page application forms until submission.

> ⚠️ **Before you use this:** Automating actions on LinkedIn (including auto-applying to jobs) likely violates [LinkedIn's User Agreement](https://www.linkedin.com/legal/user-agreement), which prohibits scraping and automated activity on the platform. Using a bot like this can result in account restrictions or a permanent ban. Use at your own risk, on an account you're comfortable losing, and review the legal/ethical implications for your situation before running it.

## How it works

1. Launches a Chrome browser via Selenium (using `webdriver-manager` to fetch a matching ChromeDriver automatically).
2. Logs into LinkedIn with the credentials in `config.py`, reusing saved cookies on later runs to skip repeated logins.
3. Builds a list of job-search URLs from your configured keywords, location, experience level, job type, and other filters (`utils.LinkedinUrlGenerate`), and writes them to `data/urlData.txt`.
4. Visits each search URL, pages through the results, and for each job:
   - Skips jobs you've already applied to, and jobs from blacklisted companies or titles (if configured).
   - Opens the job and clicks **Easy Apply**.
   - Walks through the (possibly multi-step) application form: selects a resume, fills in text fields, picks radio/checkbox/dropdown answers based on heuristics and the answer bank in `additionalQuestions.yaml`, and clicks through to submission.
5. Logs progress and results to the console and to `linkedin_bot.log`.

## Project structure

```
AutoEasyApply-LinkedIn/
├── linkedin.py                 # Main bot logic & entry point (run this file)
├── utils.py                    # Browser setup, URL generation, console/logging helpers
├── constants.py                # Fixed URLs, XPath selectors, timing constants
├── config.py                   # Your credentials and all bot settings (edit this before running)
├── additionalQuestions.yaml    # Answer bank for application form questions (Pro feature)
├── requirements.yaml           # Python dependencies (despite the extension, this is a plain pip list)
├── data/
│   └── urlData.txt             # Auto-generated list of job search URLs (regenerated each run)
└── linkedin_bot.log            # Runtime log output (auto-generated)
```

## Prerequisites

- Python 3.8+
- Google Chrome installed (Firefox support is listed as a paid "Pro" feature and is not implemented in this codebase)
- A LinkedIn account
- A resume already uploaded to your LinkedIn profile (the bot selects from your existing uploaded resumes, it doesn't upload a new one)

## Setup

1. **Clone the repository and install dependencies:**

   ```bash
   pip install -r requirements.yaml
   ```

   This installs `selenium` and `webdriver_manager`. (The file is named `.yaml` but is a flat list of package names, so plain `pip install -r` works.)

2. **Configure your credentials and preferences in `config.py`:**

   ```python
   email = "your-linkedin-email@example.com"
   password = "your-linkedin-password"
   ```

3. **Set your job search preferences in `config.py`**, including:

   | Setting | Description |
   |---|---|
   | `location` | Country/region/metro names or continent shortcuts (e.g. `["NorthAmerica"]`) |
   | `keywords` | Job search keywords, searched one at a time |
   | `experienceLevels` | e.g. `["Entry level"]`, `["Mid-Senior level"]` |
   | `datePosted` | One of `"Any Time"`, `"Past Month"`, `"Past Week"`, `"Past 24 hours"` |
   | `jobType` | e.g. `["Full-time", "Contract"]` |
   | `remote` | e.g. `["Remote", "Hybrid"]` |
   | `salary` | Minimum salary filter, e.g. `["$80,000+"]` |
   | `blacklistCompanies` / `blackListTitles` | Companies or title keywords to skip |
   | `followCompanies` | Whether to follow a company after a successful application |

   Several settings in `config.py` are marked **PRO FEATURE** in comments — these correspond to a paid version of the bot sold separately at automated-bots.com and are not functional in this open-source version (e.g. headless mode, Firefox support, AI-assisted question answering, multiple-CV selection, per-company/title allow-lists).

4. **(Optional) Fill in `additionalQuestions.yaml`** with answers the bot should give for common Easy Apply screening questions — contact info, years of experience per skill/category, and so on. The bot matches question text against the keys in this file to decide how to answer free-text and numeric fields it encounters.

5. **Run the bot:**

   ```bash
   python linkedin.py
   ```

   A Chrome window will open, log into LinkedIn (or reuse a saved session via cookies), and begin applying to matching jobs. Progress is printed to the console and appended to `linkedin_bot.log`.

## Notes & limitations

- **No headless mode** in this version — a visible Chrome window is required while the bot runs.
- **Cookies are cached locally** (in a `cookies/` folder, keyed by an MD5 hash of your email) so you don't have to log in on every run. Delete that folder to force a fresh login.
- **Answer heuristics are best-effort.** Radio buttons, checkboxes, and dropdowns are filled using simple keyword matching against question labels (e.g. defaulting to "Yes" for experience questions, checking boxes mentioning "skill" or "legally authorized"). Review `linkedin_bot.log` after a run and spot-check a few submitted applications — the bot can submit incorrect or undesired answers if a question doesn't match its heuristics.
- **This applies to real jobs automatically.** There's no dry-run/preview mode in this version — once configured and started, the bot submits live applications. Start with a narrow `keywords`/`location` configuration to test behavior before widening it.
- The `data/urlData.txt` and `linkedin_bot.log` files are regenerated/appended on every run and don't need to be committed to version control.

## Disclaimer

This project is provided as-is, for educational purposes. The author(s) are not responsible for any account restrictions, bans, or other consequences resulting from its use. You are responsible for complying with LinkedIn's terms of service and applicable law in your jurisdiction.
