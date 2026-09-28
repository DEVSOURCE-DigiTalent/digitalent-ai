import { JOB_ROLE_BENCHMARKS } from './mockMarketingFlow.js';

export const AREA_NAMES = ['Dữ liệu & thông tin', 'Giao tiếp & cộng tác', 'Nội dung số', 'An toàn số', 'Giải quyết vấn đề'];
export const LEVELS = [
  { name: 'Cơ bản', range: '1–2', code: 'F' },
  { name: 'Trung cấp', range: '3–4', code: 'I' },
  { name: 'Nâng cao', range: '5–6', code: 'A' },
];

export const BASE_ROLES = [
  { id: 'ceo', name: 'CEO / Giám đốc', family: 'Điều hành', benchmark: 'ceo_executive', priority: 1, headcount: 1 },
  { id: 'manager', name: 'Trưởng phòng', family: 'Quản lý', benchmark: 'ceo_executive', priority: 1, headcount: 3 },
  { id: 'marketing', name: 'Nhân viên Marketing', family: 'Marketing', benchmark: 'marketing_specialist', priority: 2, headcount: 3 },
  { id: 'sales', name: 'Nhân viên Kinh doanh', family: 'Kinh doanh', benchmark: 'b2b_sales', priority: 2, headcount: 4 },
  { id: 'accounting', name: 'Nhân viên Kế toán', family: 'Tài chính', benchmark: 'accountant', priority: 3, headcount: 2 },
  { id: 'hr', name: 'Nhân viên Nhân sự', family: 'Nhân sự', benchmark: 'hr_specialist', priority: 3, headcount: 2 },
];

const benchmarkFor = id => JOB_ROLE_BENCHMARKS.find(role => role.roleId === id);
export function makeRequirements(benchmarkId) {
  const benchmark = benchmarkFor(benchmarkId) || benchmarkFor('marketing_specialist');
  const raw = benchmark.competencies.map(item => item.isCore ? 25 : 10);
  const sum = raw.reduce((total, value) => total + value, 0);
  const weights = raw.map(value => Math.floor(value * 100 / sum));
  weights[0] += 100 - weights.reduce((total, value) => total + value, 0);
  return benchmark.competencies.map((item, index) => ({
    areaId: item.id,
    level: item.reqLevelNumber,
    weight: weights[index],
    mandatory: item.isCore,
    note: item.note,
  }));
}

const role = (template, overrides = {}) => ({
  ...template, ...overrides,
  requirements: makeRequirements(template.benchmark).map((requirement, index) => template.id === 'manager'
    ? { ...requirement, level: [5, 5, 4, 5, 5][index] }
    : requirement),
});

export const DEMO_ORGANIZATIONS = [
  {
    id: 'sao-mai', name: 'Sao Mai Digital', sector: 'Dịch vụ số', size: 18, hourlyCost: 120000,
    roles: BASE_ROLES.map(item => role(item, { headcount: item.id === 'sales' ? 6 : item.headcount })),
    employees: [
      { id: 'sm-ceo', name: 'Nguyễn Minh Anh', roleId: 'ceo', before: [3, 4, 3, 2, 3], after: [4, 5, 3, 4, 4], evidence: 'Minh chứng thực hành đã được mentor duyệt' },
      { id: 'sm-mkt', name: 'Trần Phương Linh', roleId: 'marketing', before: [2, 3, 3, 2, 2], after: [4, 4, 5, 3, 4], evidence: 'Minh chứng thực hành đã được mentor duyệt' },
      { id: 'sm-manager', name: 'Lê Đức Huy', roleId: 'manager', before: [3, 3, 3, 3, 2], after: null, evidence: 'Đang chờ đánh giá lại' },
    ],
    orders: [],
  },
  {
    id: 'an-phat', name: 'An Phát Retail', sector: 'Bán lẻ', size: 32, hourlyCost: 100000,
    roles: BASE_ROLES.map(item => role(item, { headcount: item.id === 'sales' ? 14 : item.headcount })),
    employees: [
      { id: 'ap-ceo', name: 'Phạm Quang Hưng', roleId: 'ceo', before: [3, 3, 2, 2, 3], after: null, evidence: 'Tự đánh giá đầu vào' },
      { id: 'ap-sales', name: 'Võ Thị Thảo', roleId: 'sales', before: [2, 3, 2, 3, 2], after: null, evidence: 'Tự đánh giá đầu vào' },
    ],
    orders: [],
  },
  {
    id: 'minh-viet', name: 'Minh Việt Foods', sector: 'Sản xuất thực phẩm', size: 24, hourlyCost: 110000,
    roles: BASE_ROLES.map(item => role(item, { headcount: item.id === 'accounting' ? 3 : item.headcount })),
    employees: [
      { id: 'mv-ceo', name: 'Đỗ Thanh Vân', roleId: 'ceo', before: [2, 3, 2, 3, 2], after: null, evidence: 'Tự đánh giá đầu vào' },
      { id: 'mv-accounting', name: 'Ngô Hoài Nam', roleId: 'accounting', before: [3, 2, 2, 3, 2], after: null, evidence: 'Tự đánh giá đầu vào' },
    ],
    orders: [],
  },
];
