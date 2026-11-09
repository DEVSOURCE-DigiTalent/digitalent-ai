"""Runs the API cases of one role against the real API and renders their evidence cards, plus the AUTO sheets.

Usage: python run_api_evidence.py <role-slug> [--skip-auto]
Needs: the API in Development on EVIDENCE_API (fresh DB, migrations + seed), Playwright (pip install playwright),
dotnet SDK and DIGITALENT_TEST_POSTGRES_CONNECTION for the PostgreSQL integration tests of the AUTO run.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys

from playwright.sync_api import sync_playwright

import api_cases
from evidence_lib import REPO, api_card_html, launch, out_dir, render_png, run_api_case, run_meta, terminal_html

sys.stdout.reconfigure(encoding='utf-8')

# Automated tests shown in the AUTO sheets of each role: its access tests, then the use-case tests of its screens.
AUTO_TESTS = {
    'platform-admin': [('PlatformAdminAccessTests', 'Ma trận quyền API của PLATFORM_ADMIN'),
                       ('DigiTalent.Tests.Platform', 'Test use case Platform Admin (khung chuẩn, catalog, tổ chức, người dùng)')],
    'mentor': [('MentorAccessTests', 'Ma trận quyền API của MENTOR'),
               ('TrialProgramFlowTests', 'Luồng dùng thử: mời → làm bài có giám sát → mentor chấm → báo cáo')],
    'owner': [('OwnerAccessTests', 'Ma trận quyền API của OWNER'),
              ('DigiTalent.Tests.Organization', 'Test use case tổ chức (thành viên, lời mời, phòng ban, vị trí)'),
              ('CapabilityCeilingTests', 'Trần năng lực doanh nghiệp / phòng ban theo suất đã mua')],
    'manager': [('ManagerAccessTests', 'Ma trận quyền API của MANAGER'),
                ('DepartmentScopeTests', 'Phạm vi dữ liệu theo phòng ban (EmployeeScope)')],
    'employee': [('EmployeeAccessTests', 'Ma trận quyền API của EMPLOYEE'),
                 ('PulseEmployeeFlowTests', 'Luồng học Pulse: lộ trình, bài đầu vào, ôn tập mô đun, bài cuối khóa có giám sát')],
}


def run_auto(slug: str, page, meta: dict, folder: str) -> list[dict]:
    records = []
    for index, (test_filter, description) in enumerate(AUTO_TESTS[slug], start=1):
        auto_id = f'AUTO{index:02d}'
        command = ['dotnet', 'test', os.path.join(REPO, 'backend', 'tests', 'DigiTalent.Tests'), '--nologo', '--no-build',
                   '--filter', f'FullyQualifiedName~{test_filter}', '--logger', 'console;verbosity=normal']
        output = subprocess.run(command, capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=REPO).stdout
        lines = [re.sub(r'\x1b\[[0-9;]*m', '', line).rstrip() for line in output.splitlines()]
        lines = [line.replace(REPO, '<repo>') for line in lines if line.strip() and not line.startswith('Build')]
        text = '\n'.join(lines)

        def count(label: str) -> int:
            match = re.search(rf'^\s*{label}:\s*(\d+)', text, re.MULTILINE)
            return int(match.group(1)) if match else 0

        total, passed, failed = count('Total tests'), count('Passed'), count('Failed')
        results = [line for line in lines if line.strip().startswith(('Passed ', 'Failed ', 'Skipped '))]
        totals = [line for line in lines if line.strip().startswith(('Test Run', 'Total tests', 'Passed:', 'Failed:', 'Skipped:'))]
        shown = [lines[0]] + results[:55] + ([f'  … còn {len(results) - 55} test đạt nữa'] if len(results) > 55 else []) + totals
        render_png(page, terminal_html(f'{auto_id} · Test tự động', f'{total} test — {description}', shown, meta,
                                       f'dotnet test · xUnit · filter {test_filter}'),
                   os.path.join(folder, 'images', f'{auto_id}.png'))
        records.append({'id': auto_id, 'filter': test_filter, 'description': description, 'total': total, 'passed': passed,
                        'failed': failed, 'status': 'PASS' if failed == 0 and total > 0 else 'FAIL'})
        print(f'  {auto_id} [{records[-1]["status"]}] {test_filter}: {passed}/{total}', flush=True)
    return records


def main() -> None:
    slug = sys.argv[1]
    folder = out_dir(slug)
    meta = run_meta()
    role = api_cases.ROLES[slug]
    print(f'API evidence for {role["label"]} → {folder}', flush=True)
    with sync_playwright() as pw:
        browser = launch(pw)
        page = browser.new_page()
        records = []
        for case in api_cases.CASES[slug]():
            record, response = run_api_case(case)
            render_png(page, api_card_html(record, case, response, meta), os.path.join(folder, 'images', f'{case.id}.png'))
            records.append(record)
        auto = [] if '--skip-auto' in sys.argv else run_auto(slug, page, meta, folder)
        browser.close()
    with open(os.path.join(folder, 'api_results.json'), 'w', encoding='utf-8') as handle:
        json.dump({'meta': meta, 'role': role, 'cases': records, 'auto': auto}, handle, ensure_ascii=False, indent=2)
    print(f'  {sum(r["status"] == "PASS" for r in records)}/{len(records)} API cases passed', flush=True)


if __name__ == '__main__':
    main()
