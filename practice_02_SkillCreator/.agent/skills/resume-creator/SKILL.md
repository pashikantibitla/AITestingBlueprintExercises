---
name: resume-creator
description: Expert resume writer and career strategist. Analyzes any user-provided file (PDF, Word, Excel, Image, TXT, MD, or web links) to enhance skills, experience, and project descriptions. Optimized for ATS and professional impact. Use when the user wants to update, refine, or create a resume from an existing file.
---

# Professional Resume Writing & Optimization (Universal Support)

This skill enables the agent to act as an elite career coach and resume writer. It systematically analyzes existing documents in any format, extracts key values, and generates high-impact professional resumes tailored to specific domains.

## When to use this skill
- When a user uploads a resume in ANY format (PDF, Word, Excel, Image, TXT, MD).
- When the user provides a link to a LinkedIn profile or portfolio website.
- When the user needs to tailor their experience to a specific job description.

## Workflow
1. [ ] **Analyze Input**: Utilize the appropriate tool for the input type:
   - **PDF**: Use the `pdf` tool.
   - **Word (.docx)**: Use the `docx` tool.
   - **Excel (.xlsx)**: Use the `xlsx` tool.
   - **Images**: Use vision capabilities to read text from screenshots/photos.
   - **Web Links**: Use `read_url_content` to fetch profile data.
   - **Text/MD/TXT**: Use `view_file`.
2. [ ] **Extract Identity**: Map out the user's Core Skills, Experience (Years/Roles), Domain Expertise, and Major Projects.
3. [ ] **Refine Content**: Rewrite bullet points using the "Action Verb + Task + Result" (STAR/XYZ) formula.
4. [ ] **Format & Style**: Structure the content in Markdown, PDF, or DOCX as requested by the user.
5. [ ] **Export**: Save the final version to the user's specified path using `write_to_file` or the `docx` creation tool.

## Instructions

### 1. Analysis Logic
- **Skill Mapping**: Categorize skills into Technical (e.g., Playwright, Java), Soft (e.g., Leadership), and Domain (e.g., Fintech, Healthcare).
- **Project Deep-Dive**: Transform vague project descriptions into quantified achievements (e.g., "Improved test coverage by 40%").

### 2. Writing Principles
- **Conciseness**: Keep descriptions punchy. Avoid first-person pronouns (I, me, my).
- **ATS Optimization**: Ensure keywords from the target domain are naturally integrated.
- **Power Verbs**: Use words like *Spearheaded*, *Architected*, *Optimized*, and *Orchestrated*.

### 3. Universal File Handling
- **Non-Textual Files**: If an image is provided, perform OCR/Vision analysis first.
- **Spreadsheets**: If skills are listed in Excel, use `xlsx` tool to extract data.
- **Default Output Path**: `C:/Users/pashi/Downloads/` (Use this as the target directory unless otherwise specified).
- **Default Output Format**: **PDF** (Use the `pdf` creation tool for the final export).
- **Verification**: Always verify the target path before saving.

## Resources
- [Resume Power Verbs Library](resources/power-verbs.md)
- [Targeted Domain Keywords](resources/domain-keywords.md)

## Example Interaction
"Based on my resume writer skill, analyze my current resume and rewrite it to highlight my experience in Playwright automation and performance testing. Save the final version as 'D:/Career/Resume_2026.md'."
