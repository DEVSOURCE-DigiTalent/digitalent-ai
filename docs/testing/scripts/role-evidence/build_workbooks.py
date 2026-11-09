"""Builds Evidence_API_<ROLE>.xlsx and Evidence_FE_<ROLE>.xlsx of one role from the run results and images.

Layout of docs/test-evidence/2026-10-05-overview-api: a "Tong hop" sheet (counts as formulas, one row per case with a
link to its sheet), one sheet per case with its evidence image, and AUTO sheets for the automated test runs.
Usage: python build_workbooks.py <role-slug>
"""
from __future__ import annotations

import json
import os
import sys

from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from PIL import Image

from evidence_lib import out_dir

sys.stdout.reconfigure(encoding='utf-8')

FONT = 'Arial'
NAVY = '1F3864'
THIN = Side(style='thin', color='BFBFBF')
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical='top')
CENTER = Alignment(horizontal='center', vertical='center', wrap_text=True)
IMAGE_WIDTH = 1180


def font(**kw) -> Font:
    return Font(name=FONT, size=kw.pop('size', 10), **kw)


def header(ws, row: int, titles: list[str], widths: list[float]) -> None:
    for col, (title, width) in enumerate(zip(titles, widths), start=1):
        cell = ws.cell(row=row, column=col, value=title)
        cell.font = font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', start_color=NAVY)
        cell.alignment = CENTER
        cell.border = BORDER
        ws.column_dimensions[get_column_letter(col)].width = width
    ws.row_dimensions[row].height = 32


def body_cell(ws, row: int, col: int, value, bold: bool = False, align=WRAP):
    cell = ws.cell(row=row, column=col, value=value)
    cell.font = font(bold=bold)
    cell.alignment = align
    cell.border = BORDER
    return cell


def status_format(ws, cell_range: str) -> None:
    ws.conditional_formatting.add(cell_range, CellIsRule(operator='equal', formula=['"PASS"'],
                                  fill=PatternFill('solid', start_color='C6EFCE'), font=Font(name=FONT, color='006100', bold=True)))
    ws.conditional_formatting.add(cell_range, CellIsRule(operator='equal', formula=['"FAIL"'],
                                  fill=PatternFill('solid', start_color='FFC7CE'), font=Font(name=FONT, color='9C0006', bold=True)))


def summary_block(ws, title: str, meta_line: str, first: int, last: int, status_col: str) -> None:
    ws['A1'] = title
    ws['A1'].font = font(bold=True, size=14, color=NAVY)
    ws['A2'] = meta_line
    ws['A2'].font = font(italic=True, color='595959')
    rows = [('Tổng số ca kiểm thử', f'=COUNTA(B{first}:B{last})'), ('Số ca PASS', f'=COUNTIF({status_col}{first}:{status_col}{last},"PASS")'),
            ('Số ca FAIL', f'=COUNTIF({status_col}{first}:{status_col}{last},"FAIL")'), ('Tỷ lệ PASS', '=IF(B4=0,0,B5/B4)')]
    for offset, (label, formula) in enumerate(rows):
        ws.cell(row=4 + offset, column=1, value=label).font = font(bold=True)
        cell = ws.cell(row=4 + offset, column=2, value=formula)
        cell.font = font(bold=True)
        if label == 'Tỷ lệ PASS':
            cell.number_format = '0.0%'


def back_link(ws) -> None:
    cell = ws['A2']
    cell.value = '← Quay lại Tổng hợp'
    cell.hyperlink = "#'Tong hop'!A1"
    cell.font = font(color='0563C1', underline='single')


def add_image(ws, path: str, anchor: str) -> None:
    with Image.open(path) as picture:
        width, height = picture.size
    image = XLImage(path)
    scale = min(1.0, IMAGE_WIDTH / width)
    image.width, image.height = int(width * scale), int(height * scale)
    ws.add_image(image, anchor)


def notes(ws, row: int, lines: list[str]) -> None:
    ws.cell(row=row, column=1, value='Ghi chú').font = font(bold=True, color=NAVY)
    for offset, line in enumerate(lines, start=1):
        ws.cell(row=row + offset, column=1, value=f'{offset}. {line}').font = font(color='404040')


def auto_sheets(wb, folder: str, auto: list[dict]) -> None:
    for record in auto:
        ws = wb.create_sheet(record['id'])
        ws['A1'] = f'{record["id"]} – Kết quả test tự động (dotnet test · filter {record["filter"]})'
        ws['A1'].font = font(bold=True, size=13, color=NAVY)
        back_link(ws)
        add_image(ws, os.path.join(folder, 'images', f'{record["id"]}.png'), 'A4')


def auto_table(ws, row: int, auto: list[dict]) -> int:
    if not auto:
        return row
    ws.cell(row=row, column=1, value='Kiểm thử tự động (xUnit, backend)').font = font(bold=True, color=NAVY)
    titles = ['STT', 'Mã', 'Bộ test (filter)', 'Nội dung', 'Số test', 'Đạt', 'Trạng thái', 'Evidence']
    for col, title in enumerate(titles, start=1):
        cell = ws.cell(row=row + 1, column=col, value=title)
        cell.font = font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', start_color=NAVY)
        cell.alignment = CENTER
        cell.border = BORDER
    for index, record in enumerate(auto, start=1):
        r = row + 1 + index
        values = [index, record['id'], record['filter'], record['description'], record['total'], record['passed'], record['status']]
        for col, value in enumerate(values, start=1):
            body_cell(ws, r, col, value, bold=col == 7)
        link = body_cell(ws, r, 8, f'Xem {record["id"]}')
        link.hyperlink = f"#'{record['id']}'!A1"
        link.font = font(color='0563C1', underline='single')
    status_format(ws, f'G{row + 2}:G{row + 1 + len(auto)}')
    return row + 2 + len(auto)


def build_api(folder: str, data: dict) -> str:
    meta, role, cases, auto = data['meta'], data['role'], data['cases'], data['auto']
    wb = Workbook()
    wb.calculation.fullCalcOnLoad = True
    ws = wb.active
    ws.title = 'Tong hop'
    first, last = 9, 8 + len(cases)
    summary_block(ws, f'BÁO CÁO KIỂM THỬ API – {role["title"]}',
                  f'Branch {meta["branch"]} @ {meta["commit"]} · API {meta["api"]} (Development) · {meta["db"]} · Ngày {meta["date"]}',
                  first, last, 'K')
    header(ws, 8, ['STT', 'Mã TC', 'Chức năng', 'Mô tả ca kiểm thử', 'Endpoint', 'Vai trò', 'Tiền điều kiện / Dữ liệu',
                   'Kết quả mong đợi', 'Kết quả thực tế', 'HTTP', 'Trạng thái', 'Evidence', 'Thời gian thực hiện'],
           [6, 8, 18, 34, 34, 16, 30, 36, 44, 7, 11, 11, 18])
    for index, case in enumerate(cases, start=1):
        r = 8 + index
        values = [index, case['id'], case['feature'], case['title'], case['endpoint'], case['role'], case['precondition'],
                  case['expected'], case['actual'], case['http'], case['status']]
        for col, value in enumerate(values, start=1):
            body_cell(ws, r, col, value, bold=col == 11, align=CENTER if col in (1, 2, 10, 11) else WRAP)
        link = body_cell(ws, r, 12, f'Xem {case["id"]}')
        link.hyperlink = f"#'{case['id']}'!A1"
        link.font = font(color='0563C1', underline='single')
        body_cell(ws, r, 13, case['at'])
    status_format(ws, f'K{first}:K{last}')
    ws.freeze_panes = 'C9'
    next_row = auto_table(ws, last + 2, auto)
    notes(ws, next_row + 1, [
        'Mỗi ca có một sheet evidence cùng tên; vùng khoanh đỏ là bằng chứng chính (HTTP status, trường dữ liệu được kiểm tra).',
        'Các ca chạy tuần tự trên một DB PostgreSQL mới: backend Development tự migrate và seed dữ liệu demo (mật khẩu Admin@1234).',
        'Ca "không được ..." kiểm tra phân quyền: API trả 403 khi vai trò thiếu quyền, 401 khi không gửi token.',
        'Token và mật khẩu trong evidence đã được che.',
        'Sheet AUTOxx: kết quả test tự động (xUnit) — ma trận quyền API của vai trò (đọc [HasPermission] của mọi endpoint) '
        'và test use case của các màn hình liên quan; test tích hợp chạy trên PostgreSQL thật.',
    ])
    for case in cases:
        sheet = wb.create_sheet(case['id'])
        sheet['A1'] = f'{case["id"]} – {case["title"]}'
        sheet['A1'].font = font(bold=True, size=13, color=NAVY)
        back_link(sheet)
        add_image(sheet, os.path.join(folder, 'images', f'{case["id"]}.png'), 'A4')
    auto_sheets(wb, folder, auto)
    path = os.path.join(folder, f'Evidence_API_{role["label"]}.xlsx')
    wb.save(path)
    return path


def build_fe(folder: str, data: dict) -> str:
    meta, role, cases = data['meta'], data['role'], data['cases']
    wb = Workbook()
    wb.calculation.fullCalcOnLoad = True
    ws = wb.active
    ws.title = 'Tong hop'
    first, last = 9, 8 + len(cases)
    summary_block(ws, f'BÁO CÁO KIỂM THỬ FRONTEND – {role["title"]} VỚI API THẬT',
                  f'Branch {meta["branch"]} @ {meta["commit"]} · FE {meta["fe"]} (Vite, VITE_USE_MOCK=false) · API {meta["api"]} '
                  f'(Development) · {meta["db"]} · Chromium 1440×900 · Ngày {meta["date"]}', first, last, 'L')
    header(ws, 8, ['STT', 'Mã TC', 'Màn hình', 'Ca kiểm thử', 'URL / thao tác', 'Vai trò', 'Tiền điều kiện / Dữ liệu',
                   'Các bước thực hiện', 'Kết quả mong đợi', 'Kết quả thực tế', 'API backend đã gọi (thực tế)', 'Trạng thái',
                   'Evidence', 'Thời gian thực hiện'],
           [5, 8, 18, 30, 26, 15, 28, 40, 40, 36, 42, 10, 11, 18])
    for index, case in enumerate(cases, start=1):
        r = 8 + index
        values = [index, case['id'], case['screen'], case['title'], case['url'], case['role'], case['precondition'],
                  '\n'.join(case['steps']), case['expected'], case['actual'], '\n'.join(case['api']) or '—', case['status']]
        for col, value in enumerate(values, start=1):
            body_cell(ws, r, col, value, bold=col == 12, align=CENTER if col in (1, 2, 12) else WRAP)
        link = body_cell(ws, r, 13, f'Xem {case["id"]}')
        link.hyperlink = f"#'{case['id']}'!A1"
        link.font = font(color='0563C1', underline='single')
        body_cell(ws, r, 14, case['at'])
    status_format(ws, f'L{first}:L{last}')
    ws.freeze_panes = 'C9'
    notes(ws, last + 2, [
        'Mỗi ca có một sheet cùng mã: thông tin ca, chú thích từng vùng khoanh đỏ (số trên khung đỏ ↔ số trong chú thích) và ảnh chụp màn hình.',
        'Trang chạy với backend thật (VITE_USE_MOCK=false) trên DB mới (migration + seed Development); đăng nhập bằng tài khoản demo của vai trò.',
        '"API backend đã gọi" là các request /api/v1 trình duyệt thực sự gửi trong ca (ghi lại từ Playwright), kèm mã HTTP.',
        'Ca "bị chặn" kiểm tra giao diện không cho vai trò vào màn hình của vai trò khác (chuyển hướng hoặc trang từ chối truy cập).',
    ])
    for case in cases:
        sheet = wb.create_sheet(case['id'])
        sheet['A1'] = f'{case["id"]} – {case["title"]}'
        sheet['A1'].font = font(bold=True, size=13, color=NAVY)
        back_link(sheet)
        sheet.column_dimensions['A'].width = 24
        sheet.column_dimensions['B'].width = 150
        info = [('Màn hình', case['screen']), ('Vai trò', case['role']), ('URL / thao tác', case['url']),
                ('Tiền điều kiện', case['precondition']), ('Các bước', '\n'.join(case['steps'])),
                ('Kết quả mong đợi', case['expected']), ('Kết quả thực tế', case['actual']),
                ('API backend đã gọi', '\n'.join(case['api']) or '—'), ('Trạng thái', case['status']), ('Thời gian', case['at']),
                ('Chú thích khoanh đỏ', '\n'.join(case['marks']) or '—')]
        for offset, (label, value) in enumerate(info):
            r = 4 + offset
            body_cell(sheet, r, 1, label, bold=True).fill = PatternFill('solid', start_color='F2F2F2')
            body_cell(sheet, r, 2, value, bold=label == 'Trạng thái')
        status_format(sheet, 'B12')
        sheet.cell(row=16, column=1, value=f'Ảnh: {case["id"]}.png').font = font(italic=True, color='595959')
        add_image(sheet, os.path.join(folder, 'images', f'{case["id"]}.png'), 'A17')
    path = os.path.join(folder, f'Evidence_FE_{role["label"]}.xlsx')
    wb.save(path)
    return path


def main() -> None:
    slug = sys.argv[1]
    folder = out_dir(slug)
    for name, builder in (('api_results.json', build_api), ('fe_results.json', build_fe)):
        source = os.path.join(folder, name)
        if os.path.exists(source):
            with open(source, encoding='utf-8') as handle:
                print('wrote', builder(folder, json.load(handle)))


if __name__ == '__main__':
    main()
