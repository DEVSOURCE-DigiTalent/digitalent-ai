import { useMemo, useState } from 'react';
import {
  Building2,
  Users,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  Globe,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import { useDepartments } from '@/hooks/use-departments';
import { useAllEmployees } from '@/hooks/use-employees';

export type AudienceMode = 'all' | 'departments' | 'custom';

export interface AudienceSelection {
  mode: AudienceMode;
  departmentIds: string[];
  employeeIds: string[];
}

interface DepartmentAudienceSelectorProps {
  value: AudienceSelection;
  onChange: (val: AudienceSelection) => void;
}

export function DepartmentAudienceSelector({
  value,
  onChange,
}: DepartmentAudienceSelectorProps) {
  const { data: departmentsPaged } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const { data: employeesData, isLoading: loadingEmployees } = useAllEmployees({ status: 'ACTIVE' }, true);

  const departments = departmentsPaged?.items ?? [];
  const employees = employeesData ?? [];

  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  // Group employees by departmentId
  const deptEmployeesMap = useMemo(() => {
    const map = new Map<string, typeof employees>();
    for (const emp of employees) {
      const deptId = emp.departmentId || 'unassigned';
      if (!map.has(deptId)) {
        map.set(deptId, []);
      }
      map.get(deptId)!.push(emp);
    }
    return map;
  }, [employees]);

  // Set mode handler
  const setMode = (mode: AudienceMode) => {
    if (mode === 'all') {
      onChange({
        mode: 'all',
        departmentIds: [],
        employeeIds: employees.map((e) => e.id),
      });
    } else if (mode === 'departments') {
      onChange({
        mode: 'departments',
        departmentIds: value.departmentIds,
        employeeIds: value.employeeIds,
      });
    } else {
      onChange({
        mode: 'custom',
        departmentIds: [],
        employeeIds: value.employeeIds,
      });
    }
  };

  const toggleExpand = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  // Select / deselect entire department
  const toggleDepartment = (deptId: string) => {
    const deptEmps = (deptEmployeesMap.get(deptId) || []).map((e) => e.id);
    const allSelected = deptEmps.every((id) => value.employeeIds.includes(id));

    let nextEmpIds: string[];
    let nextDeptIds: string[];

    if (allSelected) {
      // Remove all employees of this dept
      nextEmpIds = value.employeeIds.filter((id) => !deptEmps.includes(id));
      nextDeptIds = value.departmentIds.filter((id) => id !== deptId);
    } else {
      // Add missing employees of this dept
      const set = new Set([...value.employeeIds, ...deptEmps]);
      nextEmpIds = Array.from(set);
      nextDeptIds = Array.from(new Set([...value.departmentIds, deptId]));
    }

    onChange({
      ...value,
      departmentIds: nextDeptIds,
      employeeIds: nextEmpIds,
    });
  };

  // Toggle single employee
  const toggleEmployee = (empId: string, deptId?: string) => {
    const exists = value.employeeIds.includes(empId);
    const nextEmpIds = exists
      ? value.employeeIds.filter((id) => id !== empId)
      : [...value.employeeIds, empId];

    // Recheck department membership if deptId provided
    let nextDeptIds = [...value.departmentIds];
    if (deptId) {
      const deptEmps = (deptEmployeesMap.get(deptId) || []).map((e) => e.id);
      const allSelected = deptEmps.length > 0 && deptEmps.every((id) => nextEmpIds.includes(id));
      if (allSelected && !nextDeptIds.includes(deptId)) {
        nextDeptIds.push(deptId);
      } else if (!allSelected && nextDeptIds.includes(deptId)) {
        nextDeptIds = nextDeptIds.filter((id) => id !== deptId);
      }
    }

    onChange({
      ...value,
      departmentIds: nextDeptIds,
      employeeIds: nextEmpIds,
    });
  };

  // Select all departments
  const selectAllDepartments = () => {
    onChange({
      ...value,
      departmentIds: departments.map((d) => d.id),
      employeeIds: employees.map((e) => e.id),
    });
  };

  // Clear all selections
  const clearAll = () => {
    onChange({
      ...value,
      departmentIds: [],
      employeeIds: [],
    });
  };

  // Filtered employees for custom tab
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const term = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(term) ||
        (e.workEmail && e.workEmail.toLowerCase().includes(term)) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(term)),
    );
  }, [employees, search]);

  const totalSelectedCount = value.mode === 'all' ? employees.length : value.employeeIds.length;

  return (
    <div className="space-y-3.5">
      {/* 3 TABS CHỌN ĐỐI TƯỢNG */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('all')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            value.mode === 'all'
              ? 'bg-white text-[#304bdf] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="size-3.5" />
          <span>Toàn công ty</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('departments')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            value.mode === 'departments'
              ? 'bg-white text-[#304bdf] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="size-3.5" />
          <span>Theo phòng ban</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
            value.mode === 'custom'
              ? 'bg-white text-[#304bdf] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="size-3.5" />
          <span>Chọn từng người</span>
        </button>
      </div>

      {/* NỘI DUNG TỪNG TAB */}
      {value.mode === 'all' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-950 flex items-start gap-3">
          <Globe className="size-5 text-[#304bdf] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-slate-900 font-bold">
              Gửi tới toàn bộ nhân sự trong doanh nghiệp
            </strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tất cả <strong>{employees.length}</strong> nhân sự đang hoạt động sẽ nhận được thông báo này và hiển thị hạn chót trên trang cá nhân của họ.
            </p>
          </div>
        </div>
      )}

      {value.mode === 'departments' && (
        <div className="space-y-2">
          {/* Action bar: Chọn tất cả / Bỏ chọn */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Tick chọn một hoặc nhiều phòng ban (mở rộng để lọc chi tiết):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllDepartments}
                className="text-[#304bdf] hover:underline font-medium"
              >
                Chọn tất cả
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-slate-500 hover:underline"
              >
                Bỏ chọn hết
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-xs">
            {departments.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                Chưa có phòng ban nào được thiết lập.
              </div>
            )}

            {departments.map((dept) => {
              const deptEmps = deptEmployeesMap.get(dept.id) || [];
              const selectedInDept = deptEmps.filter((e) => value.employeeIds.includes(e.id));
              const isAllSelected = deptEmps.length > 0 && selectedInDept.length === deptEmps.length;
              const isPartiallySelected = selectedInDept.length > 0 && !isAllSelected;
              const isExpanded = expandedDepts.has(dept.id);

              return (
                <div key={dept.id} className="group">
                  {/* DÒNG PHÒNG BAN */}
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50/80 transition-colors">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleDepartment(dept.id);
                        }}
                        className="text-[#304bdf] shrink-0"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="size-4.5 text-[#304bdf]" />
                        ) : isPartiallySelected ? (
                          <MinusSquare className="size-4.5 text-[#304bdf]" />
                        ) : (
                          <Square className="size-4.5 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </button>

                      <span className="font-semibold text-slate-900 text-xs truncate">
                        {dept.name}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        ({selectedInDept.length}/{deptEmps.length})
                      </span>
                    </label>

                    {deptEmps.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(dept.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        title={isExpanded ? 'Thu gọn' : 'Xem nhân sự trong phòng'}
                      >
                        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                    )}
                  </div>

                  {/* DANH SÁCH NHÂN SỰ BÊN TRONG KHI MỞ RỘNG */}
                  {isExpanded && deptEmps.length > 0 && (
                    <div className="bg-slate-50/60 border-t border-slate-100 pl-8 pr-3 py-1 space-y-0.5">
                      {deptEmps.map((emp) => {
                        const isChecked = value.employeeIds.includes(emp.id);
                        return (
                          <label
                            key={emp.id}
                            className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white text-xs cursor-pointer select-none transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleEmployee(emp.id, dept.id)}
                              className="size-3.5 text-[#304bdf] rounded-sm focus:ring-[#304bdf]"
                            />
                            <span className="font-medium text-slate-800">{emp.fullName}</span>
                            {emp.employeeCode && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({emp.employeeCode})
                              </span>
                            )}
                            {emp.workEmail && (
                              <span className="text-[10px] text-slate-400 truncate">
                                · {emp.workEmail}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {value.mode === 'custom' && (
        <div className="space-y-2">
          {/* Ô TÌM KIẾM */}
          <div className="relative">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email hoặc mã nhân viên..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#304bdf]/30 focus:border-[#304bdf]"
            />
          </div>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white shadow-xs">
            {loadingEmployees && (
              <div className="p-4 text-center text-xs text-slate-400">
                Đang tải danh sách nhân viên...
              </div>
            )}

            {!loadingEmployees && filteredEmployees.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                Không tìm thấy nhân viên nào phù hợp.
              </div>
            )}

            {filteredEmployees.map((emp) => {
              const isChecked = value.employeeIds.includes(emp.id);
              return (
                <label
                  key={emp.id}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 text-xs cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEmployee(emp.id, emp.departmentId)}
                      className="size-4 text-[#304bdf] rounded-sm focus:ring-[#304bdf]"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        {emp.employeeCode && <span className="font-mono text-slate-400">{emp.employeeCode}</span>}
                        {emp.workEmail && <span>• {emp.workEmail}</span>}
                      </div>
                    </div>
                  </div>

                  {isChecked && (
                    <span className="shrink-0 text-[#304bdf] font-semibold text-[11px] flex items-center gap-1">
                      <Check className="size-3.5" /> Đã chọn
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* LIVE COUNTER BAR: HIỂN THỊ SỐ LƯỢNG NGƯỜI ĐÃ CHỌN */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs">
        <span className="text-slate-600 flex items-center gap-1.5">
          <User className="size-3.5 text-[#304bdf]" />
          Đã chọn: <strong className="text-slate-900 font-bold">{totalSelectedCount}</strong> nhân sự
          {value.mode === 'departments' && value.departmentIds.length > 0 && (
            <span>(từ {value.departmentIds.length} phòng ban)</span>
          )}
        </span>

        {totalSelectedCount > 0 && value.mode !== 'all' && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-red-600 hover:underline font-medium"
          >
            Xóa lựa chọn
          </button>
        )}
      </div>
    </div>
  );
}
