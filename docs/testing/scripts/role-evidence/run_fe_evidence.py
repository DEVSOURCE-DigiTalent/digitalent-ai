"""Runs the frontend cases of one role in Chromium and saves the annotated screenshots and fe_results.json.

Usage: python run_fe_evidence.py <role-slug>
Needs: Vite on EVIDENCE_FE with VITE_USE_MOCK=false, the API on EVIDENCE_API (fresh Development DB), Playwright.
"""
from __future__ import annotations

import json
import os
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

import fe_cases
from evidence_lib import annotate, clear_annotations, launch, now_text, out_dir, run_meta

sys.stdout.reconfigure(encoding='utf-8')
MAX_HEIGHT = 1800


def main() -> None:
    slug = sys.argv[1]
    folder = out_dir(slug)
    meta = run_meta()
    role = fe_cases.ROLES[slug]
    print(f'FE evidence for {role["label"]} → {folder}', flush=True)
    calls: list[str] = []

    def on_response(response) -> None:
        if '/api/v1/' in response.url and response.request.method != 'OPTIONS':
            entry = f'{response.request.method} /api/v1/{response.url.split("/api/v1/", 1)[1]} → {response.status}'
            if entry not in calls:
                calls.append(entry)

    records = []
    with sync_playwright() as pw:
        browser = launch(pw)
        context = browser.new_context(viewport={'width': 1440, 'height': 900}, locale='vi-VN')
        page = context.new_page()
        page.on('response', on_response)
        for case in fe_cases.CASES[slug]():
            calls.clear()
            shot = os.path.join(folder, 'images', f'{case.id}.png')
            try:
                passed, actual, marks = case.run(page)
                found = annotate(page, marks)
            except Exception as error:  # the case fails, the run goes on
                passed, actual, found = False, f'Lỗi: {str(error).splitlines()[0][:220]}', []
            page.screenshot(path=shot, full_page=True)
            clear_annotations(page)
            with Image.open(shot) as picture:
                if picture.height > MAX_HEIGHT:
                    picture.crop((0, 0, picture.width, MAX_HEIGHT)).save(shot)
            records.append({'id': case.id, 'screen': case.screen, 'title': case.title, 'url': case.url, 'role': role['label'] + f' ({role["email"]})',
                            'precondition': case.precondition, 'steps': case.steps, 'expected': case.expected, 'actual': actual,
                            'status': 'PASS' if passed else 'FAIL', 'api': calls[:12], 'marks': found, 'at': now_text()})
            print(f'  {case.id} [{records[-1]["status"]}] {case.title} — {actual[:120]}', flush=True)
        browser.close()
    with open(os.path.join(folder, 'fe_results.json'), 'w', encoding='utf-8') as handle:
        json.dump({'meta': meta, 'role': role, 'cases': records}, handle, ensure_ascii=False, indent=2)
    print(f'  {sum(r["status"] == "PASS" for r in records)}/{len(records)} FE cases passed', flush=True)


if __name__ == '__main__':
    main()
