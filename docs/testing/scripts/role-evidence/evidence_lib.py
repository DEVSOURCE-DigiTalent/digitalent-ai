"""Shared helpers of the role evidence scripts: real API calls, evidence images and run metadata.

Images follow docs/test-evidence/2026-10-05-overview-api:
- API case  → a request/response card with red boxes on the checked fields (TCxx.png);
- FE case   → a browser screenshot with numbered red boxes (FExx.png);
- automated → the console output of the test run with the passed lines boxed (AUTOxx.png).
"""
from __future__ import annotations

import html
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable

API = os.environ.get('EVIDENCE_API', 'http://localhost:5000')
FE = os.environ.get('EVIDENCE_FE', 'http://localhost:5173')
DB_NOTE = os.environ.get('EVIDENCE_DB_NOTE', 'PostgreSQL 16 (DB mới: migration + seed Development)')
PASSWORD = 'Admin@1234'
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
EVIDENCE_ROOT = os.path.join(REPO, 'docs', 'test-evidence')
CHROMIUM = os.environ.get('EVIDENCE_CHROMIUM')  # optional executable path of an installed Chromium


def git(*args: str) -> str:
    return subprocess.run(['git', *args], cwd=REPO, capture_output=True, text=True, encoding='utf-8').stdout.strip()


def run_meta() -> dict:
    return {
        'branch': git('rev-parse', '--abbrev-ref', 'HEAD'),
        'commit': git('rev-parse', '--short', 'HEAD'),
        'api': API,
        'fe': FE,
        'db': DB_NOTE,
        'date': datetime.now().strftime('%d/%m/%Y'),
    }


def now_text() -> str:
    return datetime.now().strftime('%d/%m/%Y %H:%M:%S')


def out_dir(slug: str) -> str:
    path = os.path.join(EVIDENCE_ROOT, f'2026-11-09-role-{slug}')
    os.makedirs(os.path.join(path, 'images'), exist_ok=True)
    return path


# ───────────────────────────── HTTP ─────────────────────────────

@dataclass
class Response:
    status: int
    body: Any
    ms: int


def call(method: str, path: str, token: str | None = None, body: Any = None) -> Response:
    data = None if body is None else json.dumps(body).encode('utf-8')
    request = urllib.request.Request(API + '/api/v1' + path, data=data, method=method)
    request.add_header('Accept', 'application/json')
    if data is not None:
        request.add_header('Content-Type', 'application/json')
    if token:
        request.add_header('Authorization', f'Bearer {token}')
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw, status = response.read(), response.status
    except urllib.error.HTTPError as error:
        raw, status = error.read(), error.code
    ms = int((time.perf_counter() - started) * 1000)
    try:
        parsed = json.loads(raw.decode('utf-8')) if raw else None
    except ValueError:
        parsed = raw.decode('utf-8', 'replace')[:2000]
    return Response(status, parsed, ms)


def login(email: str) -> str:
    response = call('POST', '/auth/login', body={'email': email, 'password': PASSWORD})
    if response.status != 200:
        raise RuntimeError(f'Login {email} failed: {response.status} {response.body}')
    return response.body['data']['accessToken']


def data_of(response: Response) -> Any:
    return response.body.get('data') if isinstance(response.body, dict) else None


# ───────────────────────────── API cases ─────────────────────────────

@dataclass
class Check:
    label: str
    test: Callable[[Response], bool]


@dataclass
class ApiCase:
    id: str
    feature: str
    title: str
    role: str
    precondition: str
    expected: str
    method: str
    path: str
    expected_status: int
    token: str | None = None
    body: Any = None
    checks: list[Check] = field(default_factory=list)
    highlight: list[str] = field(default_factory=list)  # JSON paths boxed in red, e.g. 'data.roles', 'data.items[0].status'
    display_path: str | None = None  # path shown in the evidence when the real one carries generated ids


def run_api_case(case: ApiCase) -> tuple[dict, Response]:
    response = call(case.method, case.path, case.token, case.body)
    results = [(f'HTTP status = {case.expected_status}', response.status == case.expected_status)]
    for check in case.checks:
        try:
            ok = bool(check.test(response))
        except Exception:  # a missing field is a failed check, not a crash
            ok = False
        results.append((check.label, ok))
    passed = all(ok for _, ok in results)
    record = {
        'id': case.id, 'feature': case.feature, 'title': case.title, 'role': case.role,
        'endpoint': f'{case.method} /api/v1{case.display_path or case.path}', 'precondition': case.precondition,
        'expected': case.expected, 'status': 'PASS' if passed else 'FAIL', 'http': response.status, 'ms': response.ms,
        'checks': [{'label': label, 'ok': ok} for label, ok in results],
        'actual': f'HTTP {response.status}; ' + '; '.join(f'{label}: {"đạt" if ok else "KHÔNG ĐẠT"}' for label, ok in results[1:])
        if len(results) > 1 else f'HTTP {response.status}',
        'at': now_text(),
    }
    print(f"  {case.id} [{record['status']}] {case.method} {case.path} → {response.status} ({response.ms} ms)", flush=True)
    return record, response


# ───────────────────────────── JSON rendering ─────────────────────────────

MAX_ITEMS = 3


def _scalar(value: Any) -> str:
    return html.escape(json.dumps(value, ensure_ascii=False))


def _render(value: Any, path: str, indent: int, highlight: set[str], key: str | None, last: bool) -> list[str]:
    pad = '  ' * indent
    prefix = f'{pad}{_scalar(key)}: ' if key is not None else pad
    comma = '' if last else ','
    lines: list[str]
    if isinstance(value, dict) and value:
        lines = [f'{prefix}{{']
        items = list(value.items())
        for i, (k, v) in enumerate(items):
            lines += _render(v, f'{path}.{k}' if path else k, indent + 1, highlight, k, i == len(items) - 1)
        lines.append(f'{pad}}}{comma}')
    elif isinstance(value, list) and value:
        lines = [f'{prefix}[']
        shown = value[:MAX_ITEMS]
        for i, item in enumerate(shown):
            lines += _render(item, f'{path}[{i}]', indent + 1, highlight, None, i == len(shown) - 1 and len(value) <= MAX_ITEMS)
        if len(value) > MAX_ITEMS:
            lines.append(f'{pad}  <span class="more">… còn {len(value) - MAX_ITEMS} phần tử</span>')
        lines.append(f'{pad}]{comma}')
    else:
        lines = [f'{prefix}{_scalar(value)}{comma}']
    if path in highlight:
        return ['<div class="hl">' + '\n'.join(lines) + '</div>']
    return lines


def json_html(body: Any, highlight: list[str]) -> str:
    if not isinstance(body, (dict, list)):
        return html.escape(str(body))
    # A boxed block is a <div>: the newline after it would show as an empty line inside <pre>.
    return '\n'.join(_render(body, '', 0, set(highlight), None, True)).replace('</div>\n', '</div>')


CARD_CSS = """
* { box-sizing: border-box; } body { margin: 0; background: #fff; font-family: Arial, sans-serif; color: #111827; }
.card { width: 1180px; padding: 24px 26px 30px; }
.head { display: flex; justify-content: space-between; border-bottom: 2px solid #111827; padding-bottom: 12px; }
.head h1 { margin: 0; font-size: 22px; } .head p { margin: 6px 0 0; font-size: 15px; color: #374151; }
.meta { text-align: right; font-size: 12px; color: #4b5563; line-height: 1.6; }
h2 { font-size: 13px; letter-spacing: .04em; color: #374151; margin: 22px 0 8px; }
pre { margin: 0; padding: 12px 14px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px;
      font: 13px/1.45 Consolas, 'Courier New', monospace; white-space: pre-wrap; word-break: break-word; }
.status { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #4b5563; }
.badge { font: 700 14px Consolas, monospace; padding: 7px 14px; border-radius: 6px; border: 3px solid #ef4444; }
.ok { background: #dcfce7; color: #166534; } .bad { background: #fee2e2; color: #991b1b; }
.hl { border: 3px solid #ef4444; background: #fef2f2; margin: 2px -6px; padding: 0 3px; border-radius: 3px; }
.more { color: #9ca3af; font-style: italic; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
td { border: 1px solid #e5e7eb; padding: 6px 8px; } td.r { width: 150px; font-weight: 700; }
td.pass { color: #15803d; } td.fail { color: #b91c1c; }
.result { display: inline-block; margin-top: 16px; font: 700 18px Arial; padding: 10px 18px; border-radius: 8px; border: 3px solid #ef4444; }
.term { background: #0b1120; color: #e5e7eb; border-radius: 8px; padding: 12px 14px; font: 13px/1.5 Consolas, monospace; white-space: pre-wrap; }
.term .hl { border-color: #ef4444; background: #3f0d0d; margin: 3px -6px; padding: 2px 6px; }
"""


def api_card_html(record: dict, case: ApiCase, response: Response, meta: dict) -> str:
    request_lines = [f'{case.method} {API}/api/v1{case.display_path or case.path}']
    if case.token:
        request_lines.append(f'Authorization: Bearer {case.token[:18]}…(đã che)')
    if case.body is not None:
        body = dict(case.body) if isinstance(case.body, dict) else case.body
        if isinstance(body, dict) and 'password' in body:
            body['password'] = '********'
        request_lines.append('')
        request_lines.append(json.dumps(body, ensure_ascii=False, indent=2))
    checks = ''.join(
        f'<tr><td>{html.escape(c["label"])}</td><td class="r {"pass" if c["ok"] else "fail"}">{"ĐẠT" if c["ok"] else "KHÔNG ĐẠT"}</td></tr>'
        for c in record['checks'])
    passed = record['status'] == 'PASS'
    ok_status = response.status == case.expected_status
    body = response.body
    if isinstance(body, dict) and isinstance(body.get('data'), dict):
        body = json.loads(json.dumps(body))
        for secret in ('accessToken', 'refreshToken'):
            if isinstance(body['data'].get(secret), str):
                body['data'][secret] = body['data'][secret][:18] + '…(đã che)'
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CARD_CSS}</style></head><body><div class="card">
<div class="head"><div><h1>{html.escape(record['id'])} · {html.escape(record['feature'])}</h1><p>{html.escape(record['title'])}</p></div>
<div class="meta">Thực hiện: {record['at']}<br>Vai trò: {html.escape(record['role'])}<br>API: {html.escape(meta['api'])} · {html.escape(meta['db'])}<br>
Branch {html.escape(meta['branch'])} @ {html.escape(meta['commit'])}</div></div>
<h2>REQUEST</h2><pre>{html.escape(chr(10).join(request_lines))}</pre>
<h2>RESPONSE</h2><div class="status"><span class="badge {'ok' if ok_status else 'bad'}">HTTP {response.status}</span>
<span>mong đợi {case.expected_status} · {response.ms} ms</span></div><pre>{json_html(body, case.highlight)}</pre>
<h2>KIỂM TRA</h2><table>{checks}</table>
<div class="result {'ok' if passed else 'bad'}">KẾT QUẢ: {record['status']}</div></div></body></html>"""


def terminal_html(title: str, subtitle: str, lines: list[str], meta: dict, note: str) -> str:
    body = []
    for line in lines:
        text = html.escape(line)
        boxed = line.strip().startswith('Passed ') or line.strip().startswith('Total tests') or line.strip().startswith('Passed:')
        body.append(f'<div class="hl">{text}</div>' if boxed else text)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CARD_CSS}</style></head><body><div class="card">
<div class="head"><div><h1>{html.escape(title)}</h1><p>{html.escape(subtitle)}</p></div>
<div class="meta">Thực hiện: {now_text()}<br>{html.escape(note)}<br>Branch {html.escape(meta['branch'])} @ {html.escape(meta['commit'])}</div></div>
<h2>KẾT QUẢ CHẠY</h2><div class="term">{chr(10).join(body).replace('</div>' + chr(10), '</div>')}</div></div></body></html>"""


# ───────────────────────────── browser ─────────────────────────────

def launch(pw, **kwargs):
    options = {'args': ['--no-sandbox']}
    if CHROMIUM:
        options['executable_path'] = CHROMIUM
    options.update(kwargs)
    return pw.chromium.launch(**options)


def render_png(page, html_text: str, path: str) -> None:
    page.set_viewport_size({'width': 1232, 'height': 800})
    page.set_content(html_text, wait_until='load')
    page.locator('.card').screenshot(path=path)


ANNOTATE_JS = """
(items) => {
  document.querySelectorAll('.ev-box').forEach(e => e.remove());
  items.forEach(({ x, y, w, h, label }) => {
    const box = document.createElement('div');
    box.className = 'ev-box';
    Object.assign(box.style, { position: 'absolute', left: (x - 3) + 'px', top: (y - 3) + 'px', width: (w + 6) + 'px',
      height: (h + 6) + 'px', border: '3px solid #e11d1d', borderRadius: '6px', zIndex: 2147483646, pointerEvents: 'none' });
    const tag = document.createElement('div');
    tag.textContent = label;
    // No room above a box that starts at the top of the page: put the label inside it.
    Object.assign(tag.style, { position: 'absolute', left: y < 26 ? '4px' : '-3px', top: y < 26 ? '4px' : '-22px', background: '#e11d1d', color: '#fff',
      font: '700 12px Arial, sans-serif', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' });
    box.appendChild(tag);
    document.body.appendChild(box);
  });
}
"""


def annotate(page, marks: list[tuple[Any, str]]) -> list[str]:
    """Draws numbered red boxes around the locators; returns the labels that were found on screen."""
    items, found = [], []
    for index, (locator, label) in enumerate(marks, start=1):
        try:
            target = locator.first
            target.scroll_into_view_if_needed(timeout=4000)
            box = target.bounding_box()
            scroll = page.evaluate('() => ({ x: window.scrollX, y: window.scrollY })')
            if box:
                items.append({'x': box['x'] + scroll['x'], 'y': box['y'] + scroll['y'], 'w': box['width'], 'h': box['height'],
                              'label': f'{index} · {label}'})
                found.append(f'{index}. {label}')
        except Exception:
            continue
    page.evaluate('() => window.scrollTo(0, 0)')
    page.evaluate(ANNOTATE_JS, items)
    return found


def clear_annotations(page) -> None:
    page.evaluate("() => document.querySelectorAll('.ev-box').forEach(e => e.remove())")
