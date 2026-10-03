# 16 — Thiết Kế Chấm Điểm & Rule-based Intelligence

> Nguồn gốc: Report 3 §3.1.4 (non-screen functions NF-01..03), §3.7, §3.10, §3.11.3, §5.1 BR + Report 1 §6.2. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Thiết kế chấm điểm & rule-based intelligence |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §3.7/§3.10/§3.11.3 + Report 1 §6.2 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; công thức rule-based theo **3 level** (bỏ 5-level research scale) |

---

## 2. Mục đích và phạm vi

Đặc tả **Capability Intelligence Engine**: các hàm không-màn-hình tính Skill Gap, Training Risk, Workforce Readiness và gợi ý khóa học — **rule-based, giải thích được**, không ML train. Mọi trọng số nằm ở cấu hình, không hard-code.

**Ngoài phạm vi:** ma trận màn hình (09), lưu trữ snapshot (07), quy trình chạy job (14).

---

## 3. Tài liệu tham chiếu

- Report 3 §3.1.4 — NF-01..06, §3.7, §3.10, §3.11.3
- Report 1 §6.2 — AI/analytics coverage
- `07_Thiet_Ke_CSDL_ERD.md` — bảng snapshot/score
- `00_INDEX` §3.1.4

---

## 4. Nguyên tắc thiết kế

| Nguyên tắc | Diễn giải |
|-----------|-----------|
| Rule-based xuyên suốt | Không ML train trên dữ liệu công ty; mọi số giải thích được |
| Weights in configuration | Trọng số/ngưỡng/level mapping ở `scoring_configs`, không hard-code (NFR §4.2.6) |
| Version gắn liền score | Mỗi score lưu version trọng số đã dùng — số cũ vẫn giải thích được (BR-08) |
| Snapshot không ghi đè | Kết quả cũ giữ lại để vẽ lịch sử, không tính lại rồi vứt |
| 3 level duy nhất | Thang **Basic/Intermediate/Advanced** cho cả lưu trữ lẫn hiển thị (bỏ thang 5 mức research) |
| Human-controlled AI | LLM chỉ nháp câu hỏi/ý tưởng task, người duyệt quyết định |

---

## 5. Tổng quan các hàm (NF-01..03)

| Hàm | ID | Trigger | Output |
|-----|----|---------|--------|
| Calculate Skill Gap Snapshot | NF-01 | Đêm + on-demand (HR recalculate) | 1 dòng/employee/competency, gắn version requirement |
| Calculate Training Risk Score | NF-02 | Đêm sau gap job + on-demand | Score + band + factor breakdown |
| Calculate Workforce Readiness Score | NF-03 | Đêm sau gap job + on-demand | Score + band + factor breakdown |

---

## 6. Skill Gap (NF-01)

### 6.1 Đầu vào

- Với mỗi employee: **active requirement set** của job position hiện tại + **confirmed competency profile**.
- Trên thang 3 mức: `required_level` (1–3) và `confirmed_level` (1–3).

### 6.2 Công thức

```
gap = required_level − confirmed_level
```

| Trường hợp | Xử lý |
|-----------|-------|
| Không có `confirmed_level` cho competency bắt buộc | gap = full (không coi là lỗi) |
| `gap ≤ 0` | met |
| `gap > 0` | partial gap / gap theo độ lớn |

**Phân loại gap:**

| Mức | Điều kiện |
|-----|-----------|
| Low | gap nhỏ, không mandatory |
| Medium | gap trung bình |
| High | gap lớn hoặc competency **mandatory** |

**Priority (thứ tự ưu tiên):**

```
priority = gap × weight × (mandatory ? k : 1)
```

> Gap quan trọng nhất (gap lớn + mandatory + weight cao) đứng đầu mọi danh sách.

### 6.3 Quy tắc loại trừ

- Employee **chưa gán job position** hoặc position chưa có active requirement set → **bỏ qua và báo cáo**, không đoán (BR-01, BR-09).
- Một new joiner chưa gán vị trí không làm fail cả job cho toàn công ty.

### 6.4 Output & lưu trữ

- Một dòng/employee/competency, gắn `requirement_version_id`, `run_number`, `calculated_at`.
- Kết quả cũ **không ghi đè** — đây là cơ sở của màn hình lịch sử (Employee Capability History).

---

## 7. Training Risk Score (NF-02)

### 7.1 Đầu vào (các yếu tố)

| Yếu tố | Ý nghĩa |
|--------|---------|
| Inactivity | Không hoạt động (không học/thi/task) |
| Low assessment score rate | Tỷ lệ điểm thi thấp |
| Deadline pressure | Áp lực hạn chót (task/enrollment sắp quá hạn, trễ hạn) |
| Failed attempts | Số lần thi trượt |
| Progress behind plan | Tiến độ chậm so với kế hoạch |

### 7.2 Công thức

```
risk_score = Σ (factor_valueᵢ × weightᵢ),  weight từ cấu hình, Σ weight = 100%
```

- Output: `score` + `band` (Low/Medium/High) + `factor_breakdown` (JSONB) + `weight_version_id`.
- **Risk chuyển High → alert cho Department Manager** (NF-06, SignalR).

---

## 8. Workforce Readiness Score (NF-03)

### 8.1 Đầu vào

| Yếu tố | Ý nghĩa |
|--------|---------|
| Competency coverage | Độ phủ competency so với active requirement set |
| Certificates held | Chứng chỉ đang có |
| Learning progress | Tiến độ học tập |
| Practical task performance | Kết quả task thực hành |

### 8.2 Công thức

```
readiness_score = Σ (factor_valueᵢ × weightᵢ),  weight từ cấu hình, Σ weight = 100%
```

- Output: `score` + `band` + `factor_breakdown` + `weight_version_id`.
- Đo theo **vị trí hiện tại** (không còn trục career grade).

---

## 9. Cấu hình trọng số (System Settings & Level Mapping)

### 9.1 Bốn nhóm cấu hình

| Nhóm | Nội dung |
|------|----------|
| Risk weights | Trọng số các yếu tố risk |
| Readiness weights | Trọng số các yếu tố readiness |
| Recommendation weights | Trọng số xếp hạng gợi ý khóa học |
| Competency levels | **3 mức: Basic, Intermediate, Advanced** |

### 9.2 Quy tắc

- Lưu → tạo **version mới**, archive bản cũ, đúng 1 active/group (BR-08).
- **Validation:** trọng số trong một nhóm phải cộng đúng **100%**.
- Trọng số mới áp dụng **từ lần chạy kế tiếp**; score đã lưu giữ version đã tạo ra nó — không ghi đè.
- Level mapping đọc bởi interface — đổi là cập nhật hiển thị toàn hệ thống, không đụng dữ liệu gốc.

> ⚠️ docs_v2 có `scale_type` (RESEARCH 5 mức / DISPLAY 3 mức). docs_v3 **gộp về một thang 3 mức duy nhất**, bỏ thang 5 mức và bỏ `level_scale_mappings`.

---

## 10. Gợi ý khóa học (Recommendation)

- Xếp hạng khóa học theo **mức lấp gap còn lại** (dùng recommendation weights).
- Mỗi gợi ý kèm **lý do** (vd: "khóa học target competency X, gap hiện 2 level").
- Employee có thể enroll trực tiếp (nếu được phép) hoặc nhờ manager.

---

## 11. LLM (tùy chọn, human-controlled)

| Dùng | Giới hạn |
|------|----------|
| Nháp câu hỏi (question draft) | Cờ `is_ai_drafted`, phải người duyệt |
| Ý tưởng task (task suggestion) | Cờ `is_ai_drafted`, phải người duyệt |
| Giải thích dữ liệu đã duyệt | Chỉ trên dữ liệu hệ thống |

- LLM lỗi **không chặn** luồng nghiệp vụ lõi (NFR §4.2.2).
- Không có chatbot, RAG, ML tùy chỉnh trong MVP (Report 1 §6.2).

---

## 12. Ma trận vết

| Hạng mục | NF/BR | File |
|----------|-------|------|
| Skill gap formula | NF-01, BR-01, BR-09 | 07 |
| Risk score | NF-02, BR-09 | 15 |
| Readiness score | NF-03, BR-09 | 07 |
| Weights config | BR-08, NFR §4.2.6 | 07 |
| 3-level scale | Chỉ đạo 3-level | 00, 07 |
| Course recommendation | NF-01, UC-23/24 | 04 |
| Alert high risk | NF-06 | 15 |
