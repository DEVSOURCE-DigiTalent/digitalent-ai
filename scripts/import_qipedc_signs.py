#!/usr/bin/env python3
"""Import sign videos of the QIPEDC dictionary (https://qipedc.moet.gov.vn/dictionary) into the DigiTalent
sign dictionary (PA-18) through the platform API.

Only the signs a lesson needs are fetched — never the whole 4,000-sign collection:
  * the words and phrases QIPEDC has for the captions of the given lesson videos (--asset) or texts (--text,
    --words-file), longest phrase first, as the dictionary matcher reads them;
  * with --alphabet, the finger alphabet, the five tone marks and the numbers (for spelling).

Rights. The QIPEDC site states no licence and no terms of use. Its videos are the work of the Ministry of Education
and Training project (Ban Quản lý các dự án Bộ GD&ĐT, qipedc.pmb@moet.gov.vn). Each imported sign records that
source, its own video link and a licence note saying it is used for non-commercial study only, without a written
licence. The dictionary asks for "đã cho phép" before a video may be used; this script only sets it when the
person running it passes --confirm-noncommercial-use. Ask QIPEDC for written permission before any commercial use.

Each sign: region from the QIPEDC code (…B = VN-BAC, …N = VN-NAM, …T = VN-TRUNG, none = VN), variant
"QIPEDC <code>", the regional variant of --preferred-region marked as the default sign when the word has no default
yet. Re-running skips what is already imported. Videos are cached on disk and fetched one at a time.

Usage (API running, Platform Admin account):
  python scripts/import_qipedc_signs.py --asset <video asset id> --alphabet --dry-run
  python scripts/import_qipedc_signs.py --asset <video asset id> --alphabet --confirm-noncommercial-use
The asset id is in the link of the lesson video (…/platform/assets/<id>/content…). Password: --password,
the DT_PASSWORD environment variable, or a prompt.
"""

from __future__ import annotations

import argparse
import getpass
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

QIPEDC_BASE = "https://qipedc.moet.gov.vn"
SOURCE_NAME = "QIPEDC – Từ điển ngôn ngữ ký hiệu (Bộ GD&ĐT)"
VARIANT_PREFIX = "QIPEDC"
REGIONS = {"B": "VN-BAC", "N": "VN-NAM", "T": "VN-TRUNG", "": "VN"}
TYPE_WORD, TYPE_NUMBER, TYPE_LETTER = 0, 1, 2
MAX_PHRASE_WORDS = 6
USER_AGENT = "DigiTalent-sign-dictionary-import/1.0"

LICENSE_NOTE = (
    "Video của dự án QIPEDC (Bộ GD&ĐT). Trang nguồn không ghi giấy phép hay điều khoản sử dụng; "
    "chưa có văn bản cho phép riêng cho DigiTalent. Chỉ dùng phi thương mại cho mục đích học tập "
    "(quyết định của chủ dự án, {day}). Dùng thương mại phải xin phép Ban QLDA Bộ GD&ĐT "
    "(qipedc.pmb@moet.gov.vn)."
)


# ----- Text normalization: mirrors SignTextNormalizer (backend) -------------------------------------------------

NON_SPEECH = re.compile(r"\[[^\]]*\]")
QUALIFIER = re.compile(r"\([^)]*\)")
WORD = re.compile(r"[^\W_]+")


def words_of(text: str) -> list[str]:
    """Words as written, NFC, without "[sounds]" and punctuation."""
    spoken = NON_SPEECH.sub(" ", unicodedata.normalize("NFC", text or ""))
    return WORD.findall(spoken)


def key_of(text: str) -> str:
    return " ".join(w.lower() for w in words_of(text))


def is_capitalized(word: str) -> bool:
    letters = [c for c in word if c.isalpha()]
    return len(letters) >= 2 and all(c.isupper() for c in letters)


# ----- QIPEDC catalogue ----------------------------------------------------------------------------------------

@dataclass
class QipedcSign:
    code: str          # e.g. W00492, D0490B
    base_code: str     # code without the region letter
    region: str        # VN, VN-BAC, VN-NAM, VN-TRUNG
    kind: str          # WORD / LETTER / TONE / DIGIT
    gloss: str         # text stored in the dictionary
    key: str           # lookup key of the gloss (qualifier left out)
    synonyms: list[str] = field(default_factory=list)
    description: str = ""


def split_code(code: str) -> tuple[str, str]:
    if code and code[-1] in "BNT" and code[:-1][-1:].isdigit():
        return code[:-1], REGIONS[code[-1]]
    return code, REGIONS[""]


def to_sign(item: dict) -> QipedcSign | None:
    code = str(item.get("_id") or "").strip()
    word = unicodedata.normalize("NFC", str(item.get("word") or "")).strip()
    if not code or not word:
        return None
    base, region = split_code(code)
    kind_type = item.get("type")
    description = str(item.get("description") or "").strip()

    if kind_type == TYPE_LETTER:
        if word.lower().startswith("dấu "):
            return QipedcSign(code, base, region, "TONE", word.lower(), key_of(word), description=description)
        letter = word.strip().upper()
        if len(letter) != 1:
            return None
        return QipedcSign(code, base, region, "LETTER", letter, letter.lower(), description=description)

    if kind_type == TYPE_NUMBER:
        digits = re.sub(r"\s+", "", QUALIFIER.sub("", word))
        if not digits.isdigit():
            return None
        return QipedcSign(code, base, region, "DIGIT", digits, digits, description=description)

    # A word or phrase. "cùng / với (giới từ)" = two ways to say the same sign: the first is the gloss, the
    # others its synonyms; the qualifier in parentheses stays on the gloss (shown to the reviewer, never matched).
    qualifiers = " ".join(QUALIFIER.findall(word))
    alternatives = [a.strip() for a in QUALIFIER.sub(" ", word).split("/") if a.strip()]
    if not alternatives:
        return None
    gloss = re.sub(r"\s+", " ", f"{alternatives[0]} {qualifiers}").strip()
    if len(gloss) > 100 or not key_of(alternatives[0]):
        return None
    synonyms = [a for a in alternatives[1:] if key_of(a)]
    return QipedcSign(code, base, region, "WORD", gloss, key_of(alternatives[0]), synonyms, description)


def http(request: urllib.request.Request, timeout: int = 60) -> bytes:
    request.add_header("User-Agent", USER_AGENT)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def load_catalogue(cache: Path, refresh: bool) -> list[QipedcSign]:
    path = cache / "dictionary.json"
    if refresh or not path.exists():
        print("Đang tải danh mục QIPEDC (một lần, lưu vào bộ nhớ đệm)…")
        body = urllib.parse.urlencode({"group": 20, "text": ""}).encode()
        data = http(urllib.request.Request(f"{QIPEDC_BASE}/dictionary/getAll", data=body, method="POST"))
        cache.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    items = json.loads(path.read_text(encoding="utf-8")).get("data") or []
    return [s for s in (to_sign(i) for i in items) if s is not None]


def download_video(sign: QipedcSign, cache: Path, delay: float) -> Path:
    path = cache / "videos" / f"{sign.code}.mp4"
    if path.exists() and path.stat().st_size > 0:
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    data = http(urllib.request.Request(f"{QIPEDC_BASE}/videos/{urllib.parse.quote(sign.code)}.mp4"), timeout=120)
    if len(data) == 0:
        raise RuntimeError("video rỗng")
    path.write_bytes(data)
    time.sleep(delay)  # one file at a time, gently: this is a public service of the Ministry
    return path


# ----- Picking the signs a text needs --------------------------------------------------------------------------

def words_needed(texts: list[str], words_index: dict[str, list[QipedcSign]]) -> tuple[set[str], list[str]]:
    """Keys of the QIPEDC words found in the texts, longest phrase first (as the matcher reads them), and the
    words left without a QIPEDC sign."""
    found: set[str] = set()
    missing: list[str] = []
    for text in texts:
        words = words_of(text)
        all_caps = len([w for w in words if any(c.isalpha() for c in w)]) >= 3 and all(
            is_capitalized(w) for w in words if any(c.isalpha() for c in w))
        i = 0
        while i < len(words):
            for length in range(min(MAX_PHRASE_WORDS, len(words) - i), 0, -1):
                span = words[i:i + length]
                key = " ".join(w.lower() for w in span)
                if key not in words_index:
                    continue
                # "AI" is not the pronoun "ai": a word in capitals only takes a sign written the same way.
                if not all_caps and any(is_capitalized(w) for w in span) and not any(
                        words_of(QUALIFIER.sub(" ", s.gloss)) == span for s in words_index[key]):
                    continue
                found.add(key)
                i += length
                break
            else:
                if not any(c.isdigit() for c in words[i]):
                    missing.append(words[i])
                i += 1
    return found, missing


# ----- DigiTalent API ------------------------------------------------------------------------------------------

class Api:
    def __init__(self, base: str, token: str | None = None):
        self.base = base.rstrip("/") + "/api/v1"
        self.token = token

    def call(self, method: str, path: str, body: dict | None = None, raw: bytes | None = None,
             content_type: str | None = None, timeout: int = 120):
        data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
        request = urllib.request.Request(self.base + path, data=data, method=method)
        if self.token:
            request.add_header("Authorization", f"Bearer {self.token}")
        if data is not None:
            request.add_header("Content-Type", content_type or "application/json")
        try:
            payload = json.loads(http(request, timeout) or b"{}")
        except urllib.error.HTTPError as error:
            try:
                payload = json.loads(error.read() or b"{}")
            except ValueError:
                payload = {}
            errors = "; ".join(e.get("message", "") for e in payload.get("errors") or [])
            raise RuntimeError(f"{method} {path} → {error.code} {payload.get('message', '')} {errors}".strip()) from None
        return payload.get("data")

    def login(self, email: str, password: str) -> None:
        self.token = self.call("POST", "/auth/login", {"email": email, "password": password})["accessToken"]

    def captions(self, asset_id: str) -> list[str]:
        data = self.call("GET", f"/platform/assets/{asset_id}/captions")
        cues = (data.get("publishedCues") or []) + (data.get("draftCues") or [])
        return [c.get("text", "") for c in cues]

    def dictionary(self) -> list[dict]:
        signs, page = [], 1
        while True:
            data = self.call("GET", f"/platform/sign-glosses?pageSize=100&pageIndex={page}")
            signs.extend(data.get("items") or [])
            if page >= (data.get("totalPages") or 1):
                return signs
            page += 1

    def upload_video(self, path: Path, file_name: str) -> str:
        boundary = uuid.uuid4().hex
        head = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{file_name}\"\r\n"
                f"Content-Type: video/mp4\r\n\r\n").encode()
        body = head + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
        data = self.call("POST", "/platform/assets", raw=body, content_type=f"multipart/form-data; boundary={boundary}")
        return data["assetId"]

    def create_sign(self, payload: dict) -> dict:
        return self.call("POST", "/platform/sign-glosses", payload)


# ----- Main ----------------------------------------------------------------------------------------------------

def default_cache() -> Path:
    root = os.environ.get("LOCALAPPDATA") or os.path.join(Path.home(), ".cache")
    return Path(root) / "digitalent" / "qipedc"


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Nhập video ký hiệu QIPEDC cho các từ bài học cần.")
    parser.add_argument("--api", default="http://localhost:5000", help="địa chỉ backend (mặc định http://localhost:5000)")
    parser.add_argument("--email", default="platform@digitalent.ai")
    parser.add_argument("--password", default=os.environ.get("DT_PASSWORD"))
    parser.add_argument("--asset", action="append", default=[], help="id video bài học: lấy từ trong phụ đề của nó")
    parser.add_argument("--text", action="append", default=[], help="câu cần ký hiệu")
    parser.add_argument("--words-file", help="tệp văn bản, mỗi dòng một câu hoặc một từ")
    parser.add_argument("--alphabet", action="store_true", help="thêm bảng chữ cái ngón tay, dấu thanh và chữ số")
    parser.add_argument("--skip", action="append", default=[],
                        help="không nhập từ này hoặc mã QIPEDC này (ví dụ --skip quả --skip W01595)")
    parser.add_argument("--regions", default="B,N,T", help="biến thể vùng cần nhập: B,N,T (mặc định cả ba)")
    parser.add_argument("--preferred-region", default="B", choices=["B", "N", "T", "none"],
                        help="biến thể làm ký hiệu mặc định khi từ có nhiều vùng (mặc định B = miền Bắc)")
    parser.add_argument("--cache", type=Path, default=default_cache())
    parser.add_argument("--refresh", action="store_true", help="tải lại danh mục QIPEDC")
    parser.add_argument("--delay", type=float, default=0.5, help="giây nghỉ giữa hai lần tải video")
    parser.add_argument("--dry-run", action="store_true", help="chỉ in danh sách, không tải, không ghi")
    parser.add_argument("--confirm-noncommercial-use", action="store_true",
                        help="xác nhận chỉ dùng phi thương mại cho học tập (bắt buộc để ghi vào từ điển)")
    args = parser.parse_args()

    wanted_regions = {REGIONS[r.strip().upper()] for r in args.regions.split(",") if r.strip().upper() in ("B", "N", "T")}
    wanted_regions.add(REGIONS[""])  # a sign without regional variants is always taken
    preferred_region = None if args.preferred_region == "none" else REGIONS[args.preferred_region]
    write = not args.dry_run
    if write and not args.confirm_noncommercial_use:
        print("Dừng: video QIPEDC không có giấy phép công bố. Chạy với --confirm-noncommercial-use để xác nhận "
              "chỉ dùng phi thương mại cho học tập, hoặc --dry-run để xem trước.")
        return 2

    catalogue = load_catalogue(args.cache, args.refresh)
    words_index: dict[str, list[QipedcSign]] = {}
    for sign in catalogue:
        if sign.kind == "WORD":
            for key in [sign.key, *map(key_of, sign.synonyms)]:
                words_index.setdefault(key, []).append(sign)

    api = Api(args.api)
    need_login = write or bool(args.asset)
    if need_login:
        password = args.password or getpass.getpass(f"Mật khẩu {args.email}: ")
        api.login(args.email, password)

    texts = list(args.text)
    for asset_id in args.asset:
        texts.extend(api.captions(asset_id))
    if args.words_file:
        texts.extend(line for line in Path(args.words_file).read_text(encoding="utf-8").splitlines() if line.strip())

    keys, missing = words_needed(texts, words_index)
    chosen = [s for k in sorted(keys) for s in words_index[k]]
    if args.alphabet:
        chosen.extend(s for s in catalogue if s.kind in ("LETTER", "TONE", "DIGIT"))
    skipped = {key_of(s) for s in args.skip} | {s.strip().upper() for s in args.skip}
    chosen = [s for s in {s.code: s for s in chosen}.values()
              if s.region in wanted_regions and not ({s.key, s.code, s.base_code} & skipped)]

    existing = api.dictionary() if need_login else []
    taken = {(e["gloss"].lower(), e["kind"], e["region"], e.get("variant")) for e in existing}
    has_default = {(key_of(QUALIFIER.sub(" ", e["gloss"])), e["kind"]) for e in existing if e.get("isPreferred")}

    # One QIPEDC sign per word (whatever its regional variants) may become the default sign of that word.
    meanings: dict[tuple[str, str], set[str]] = {}
    for sign in chosen:
        meanings.setdefault((sign.key, sign.kind), set()).add(sign.base_code)
    regions_of: dict[str, set[str]] = {}
    for sign in chosen:
        regions_of.setdefault(sign.base_code, set()).add(sign.region)

    def default_for(sign: QipedcSign) -> bool:
        if len(meanings[(sign.key, sign.kind)]) > 1 or (sign.key, sign.kind) in has_default:
            return False  # several meanings (the reviewer picks), or the admin already chose a default
        regions = regions_of[sign.base_code]
        if len(regions) == 1:
            return True
        return preferred_region is not None and sign.region == preferred_region

    plan = [s for s in chosen if (s.gloss.lower(), s.kind, s.region, f"{VARIANT_PREFIX} {s.base_code}") not in taken]
    plan.sort(key=lambda s: ({"WORD": 0, "LETTER": 1, "TONE": 2, "DIGIT": 3}[s.kind], s.key, s.region))
    print(f"Từ trong văn bản có ký hiệu QIPEDC: {len(keys)} · ký hiệu cần nhập: {len(plan)} "
          f"(đã có sẵn: {len(chosen) - len(plan)})")
    if missing:
        unique_missing = list(dict.fromkeys(missing))
        print(f"QIPEDC không có ({len(unique_missing)}): {', '.join(unique_missing)}")

    license_note = LICENSE_NOTE.format(day=date.today().isoformat())
    done = failed = 0
    for sign in plan:
        label = f"{sign.kind:<6} {sign.gloss:<28} {sign.region:<8} {sign.code}"
        if not write:
            print(f"  · {label}{'  (mặc định)' if default_for(sign) else ''}")
            continue
        try:
            video = download_video(sign, args.cache, args.delay)
            asset_id = api.upload_video(video, f"qipedc-{sign.code}.mp4")
            default = default_for(sign)
            api.create_sign({
                "gloss": sign.gloss,
                "kind": sign.kind,
                "videoAssetId": asset_id,
                "sourceName": SOURCE_NAME,
                "sourceUrl": f"{QIPEDC_BASE}/videos/{sign.code}.mp4",
                "licenseNote": license_note,
                "mirrored": False,
                "signLanguage": "VSL",
                "region": sign.region,
                "variant": f"{VARIANT_PREFIX} {sign.base_code}",
                "isPreferred": default,
                "priority": 0,
                "synonyms": sign.synonyms,
                "consentConfirmed": True,
            })
            if default:
                has_default.add((sign.key, sign.kind))
            done += 1
            print(f"  ✓ {label}")
        except (RuntimeError, urllib.error.URLError, OSError) as error:
            failed += 1
            print(f"  ✗ {label}: {error}")

    if write:
        print(f"Xong: {done} ký hiệu đã thêm (bản nháp, có video), {failed} lỗi. Mở Từ điển ký hiệu để xem; "
              "phân tích lại phụ đề trong khối video để dùng chúng.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
