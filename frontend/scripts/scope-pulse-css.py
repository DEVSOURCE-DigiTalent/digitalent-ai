"""Concatenate the Pulse mock stylesheets and scope every rule under `.pulse-ui`.

Usage (from the repository root):
    python frontend/scripts/scope-pulse-css.py docs/ui-redesign/14-pulse-product-site frontend/src/features/platform/pulse-mock.css
"""
import re
import sys
from pathlib import Path

SCOPE = '.pulse-ui'
FILES = [
    'styles.css',
    '../assets/pulse-unified-integration.css',
    'pulse-reuse.css',
    'secondary-flows.css',
    'flow-conformance.css',
    'pulse-visual-refresh.css',
    'pulse-role-design.css',
    'pulse-roadmap.css',
    'pulse-course-studio.css',
    'pulse-profiles.css',
    'pulse-paid-cohorts.css',
    'pulse-capability-progress.css',
    'pulse-path-entitlements.css',
]


def scope_selector(sel: str) -> str:
    sel = sel.strip()
    if not sel:
        return sel
    # root-like selectors become the scope element itself
    m = re.match(r'^(:root|html|body)(?![\w-])(.*)$', sel)
    if m:
        rest = m.group(2)
        # "html body x", ":root:not(..)" etc.
        rest = re.sub(r'^\s*(html|body)(?![\w-])', '', rest)
        return SCOPE + rest
    if sel.startswith('#toast'):
        return SCOPE + ' ' + sel
    return f'{SCOPE} {sel}'


def split_top(s: str, sep: str = ','):
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == sep and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    parts.append(cur)
    return parts


def process(css: str) -> str:
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1:
            out.append(css[i:])
            break
        head = css[i:j].strip()
        # find matching brace
        depth, k = 0, j
        while k < n:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
                if depth == 0:
                    break
            k += 1
        body = css[j + 1:k]
        i = k + 1
        if head.startswith('@media') or head.startswith('@supports'):
            out.append(f'{head}{{{process(body)}}}\n')
        elif head.startswith('@'):
            out.append(f'{head}{{{body}}}\n')
        else:
            selectors = ','.join(scope_selector(s) for s in split_top(head))
            out.append(f'{selectors}{{{body}}}\n')
    return ''.join(out)


def main():
    base, target = Path(sys.argv[1]), Path(sys.argv[2])
    chunks = []
    for name in FILES:
        css = (base / name).read_text(encoding='utf-8')
        css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
        # background images of owner/manager screens are not shipped with the admin console
        css = re.sub(r"url\(['\"]?\.\./assets/[^)]*\)", 'none', css)
        chunks.append(f'/* --- {name} --- */\n' + process(css))
    header = (
        '/*\n * GENERATED from docs/ui-redesign/14-pulse-product-site (Pulse mock) — every rule scoped under .pulse-ui.\n'
        ' * Regenerate from the repository root with: python frontend/scripts/scope-pulse-css.py docs/ui-redesign/14-pulse-product-site frontend/src/features/platform/pulse-mock.css; do not edit by hand. Overrides live in pulse-admin.css.\n */\n'
    )
    target.write_text(header + '\n'.join(chunks), encoding='utf-8', newline='\n')


if __name__ == '__main__':
    main()
