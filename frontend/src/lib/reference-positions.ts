/**
 * The five MVP reference positions. DigiTalent AI builds them on top of the TT02 digital competency framework:
 * Circular 02/2025 defines the framework (6 domains, 24 competencies, 8 tiers), not these job positions.
 * Each position maps to the competencies it needs and the level it requires of each.
 *
 * Shared by the organization setup (spec PLT-08), the individual landing page and /careers, until the backend
 * exposes GET /reference-positions. Source: docs/specs/2026-09-29-tt02-position-competency-matrix.md §4,
 * mirrored from backend Tt02Catalog.Positions.
 */
export interface ReferencePosition {
  code: string;
  name: string;
  description: string;
  /**
   * Required level of each of the 24 competencies in framework order (1.1 … 6.3):
   * 0 = not required, 1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao.
   */
  levels: readonly number[];
}

/** The 6 domains of the framework with the number of competencies each holds. */
export const TT02_DOMAINS = [
  { number: 1, name: 'Khai thác dữ liệu và thông tin', competencyCount: 3 },
  { number: 2, name: 'Giao tiếp và hợp tác trong môi trường số', competencyCount: 6 },
  { number: 3, name: 'Sáng tạo nội dung số', competencyCount: 4 },
  { number: 4, name: 'An toàn', competencyCount: 4 },
  { number: 5, name: 'Giải quyết vấn đề', competencyCount: 4 },
  { number: 6, name: 'Ứng dụng trí tuệ nhân tạo', competencyCount: 3 },
] as const;

export const REFERENCE_POSITIONS: ReferencePosition[] = [
  { code: 'CEO', name: 'Giám đốc điều hành', description: 'Định hướng chuyển đổi số và quản trị rủi ro dữ liệu.', levels: [2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 0, 2, 0, 3, 3, 2, 2, 0, 3, 3, 3, 3, 3, 3] },
  { code: 'HR', name: 'Nhân sự', description: 'Quản lý hồ sơ nhân sự, tuyển dụng và đào tạo bằng công cụ số.', levels: [2, 2, 2, 3, 2, 2, 3, 3, 2, 2, 1, 1, 0, 2, 3, 3, 1, 1, 2, 2, 3, 2, 2, 1] },
  { code: 'MARKETING', name: 'Marketing', description: 'Nội dung số, truyền thông đa kênh và phân tích dữ liệu.', levels: [3, 3, 2, 3, 3, 0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 0, 1, 2, 3, 2, 3, 3, 3] },
  { code: 'SALES_CRM', name: 'Kinh doanh (CRM)', description: 'Chăm sóc khách hàng và theo dõi cơ hội bán hàng trên CRM.', levels: [2, 2, 3, 3, 3, 0, 3, 3, 2, 2, 1, 0, 0, 2, 3, 1, 0, 1, 2, 2, 1, 2, 2, 1] },
  { code: 'ACCOUNTANT', name: 'Kế toán', description: 'Xử lý chứng từ, báo cáo và bảo mật dữ liệu tài chính.', levels: [2, 3, 3, 2, 2, 3, 2, 1, 2, 1, 0, 0, 2, 2, 3, 1, 0, 1, 2, 2, 1, 1, 2, 2] },
];

/** Names of the 24 competencies of Circular 02/2025, by code ("1.1" … "6.3"). */
export const TT02_COMPETENCY_NAMES: Record<string, string> = {
  '1.1': 'Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số',
  '1.2': 'Đánh giá dữ liệu, thông tin và nội dung số',
  '1.3': 'Quản lý dữ liệu, thông tin và nội dung số',
  '2.1': 'Tương tác thông qua công nghệ số',
  '2.2': 'Chia sẻ thông tin và nội dung thông qua công nghệ số',
  '2.3': 'Sử dụng công nghệ số để thực hiện trách nhiệm công dân',
  '2.4': 'Hợp tác thông qua công nghệ số',
  '2.5': 'Thực hiện quy tắc ứng xử trên mạng',
  '2.6': 'Quản lý danh tính số',
  '3.1': 'Phát triển nội dung số',
  '3.2': 'Tích hợp và tạo lập lại nội dung số',
  '3.3': 'Thực thi bản quyền và giấy phép',
  '3.4': 'Lập trình',
  '4.1': 'Bảo vệ thiết bị',
  '4.2': 'Bảo vệ dữ liệu cá nhân và quyền riêng tư',
  '4.3': 'Bảo vệ sức khỏe và an sinh số',
  '4.4': 'Bảo vệ môi trường',
  '5.1': 'Giải quyết các vấn đề kỹ thuật',
  '5.2': 'Xác định nhu cầu và giải pháp công nghệ',
  '5.3': 'Sử dụng sáng tạo công nghệ số',
  '5.4': 'Xác định các vấn đề cần cải thiện về năng lực số',
  '6.1': 'Hiểu biết về AI (trong đó có Gen AI)',
  '6.2': 'Sử dụng AI có đạo đức và trách nhiệm',
  '6.3': 'Đánh giá các công cụ AI',
};

export function getReferencePosition(code: string): ReferencePosition | undefined {
  return REFERENCE_POSITIONS.find((position) => position.code === code);
}

export interface DomainRequirementSummary {
  number: number;
  name: string;
  /** Competencies of the domain the position requires. */
  selected: number;
  total: number;
  /** Highest required level in the domain; 0 when none is required. */
  highestLevel: number;
}

export interface RequirementSummary {
  /** Competencies the position requires, out of 24. */
  selected: number;
  domains: DomainRequirementSummary[];
}

/** Counts what a reference position asks for, per domain and in total. */
export function summarizeRequirements(position: ReferencePosition): RequirementSummary {
  let offset = 0;
  const domains = TT02_DOMAINS.map((domain) => {
    const levels = position.levels.slice(offset, offset + domain.competencyCount);
    offset += domain.competencyCount;
    return {
      number: domain.number,
      name: domain.name,
      selected: levels.filter((level) => level > 0).length,
      total: domain.competencyCount,
      highestLevel: Math.max(0, ...levels),
    };
  });
  return { selected: domains.reduce((sum, domain) => sum + domain.selected, 0), domains };
}

export interface RequiredCompetency {
  code: string;
  name: string;
  /** 1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao. */
  level: number;
}

export interface DomainRequirements {
  number: number;
  name: string;
  items: RequiredCompetency[];
  /** Codes of the domain's competencies the position does not need. */
  notRequired: string[];
}

/** The competencies a position requires, grouped by domain; competencies it does not need are left out. */
export function requirementsByDomain(position: ReferencePosition): DomainRequirements[] {
  let offset = 0;
  return TT02_DOMAINS.map((domain) => {
    const items: RequiredCompetency[] = [];
    const notRequired: string[] = [];
    for (let index = 0; index < domain.competencyCount; index += 1) {
      const level = position.levels[offset + index];
      const code = `${domain.number}.${index + 1}`;
      if (level > 0) items.push({ code, name: TT02_COMPETENCY_NAMES[code], level });
      else notRequired.push(code);
    }
    offset += domain.competencyCount;
    return { number: domain.number, name: domain.name, items, notRequired };
  });
}

export const ORGANIZATION_SIZES = [
  { value: '1-20', label: '1–20 nhân viên' },
  { value: '21-100', label: '21–100 nhân viên' },
  { value: '101-500', label: '101–500 nhân viên' },
  { value: '500+', label: 'Trên 500 nhân viên' },
] as const;

export const ORGANIZATION_INDUSTRIES = [
  'Công nghệ thông tin',
  'Tài chính – Ngân hàng',
  'Sản xuất',
  'Thương mại – Bán lẻ',
  'Giáo dục',
  'Y tế',
  'Dịch vụ',
  'Khác',
] as const;
