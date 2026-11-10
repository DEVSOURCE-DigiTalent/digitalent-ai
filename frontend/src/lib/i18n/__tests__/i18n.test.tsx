import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { useState } from 'react';
import { LanguageEffects, LANGUAGE_STORAGE_KEY, translateUi, uiLocale, useLanguageStore, useUiLanguage } from '..';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { formatRelativeTime } from '@/lib/utils';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';

function EditingScreen() {
  useUiLanguage();
  const [name,setName]=useState('Nguyễn Văn Chủ');
  const [department,setDepartment]=useState('dept-sales');
  return <><LanguageEffects/><LanguageSwitcher/><h1>{translateUi('Nhân sự')}</h1>
    <label>{translateUi('Họ và tên')}<input value={name} onChange={e=>setName(e.target.value)}/></label>
    <label>{translateUi('Phòng ban')}<select value={department} onChange={e=>setDepartment(e.target.value)}><option value="dept-sales">Sales/CRM</option><option value="dept-hr">HR</option></select></label>
    <output>{department}</output></>;
}
beforeEach(()=>{localStorage.clear();useLanguageStore.setState({language:'vi'});});
afterEach(()=>{cleanup();useLanguageStore.setState({language:'vi'});vi.restoreAllMocks();});
describe('interface language',()=>{
  it('switches immediately and preserves unsaved fields and IDs',()=>{
    render(<EditingScreen/>);
    fireEvent.change(screen.getByLabelText('Họ và tên'),{target:{value:'Tên đang nhập'}});
    fireEvent.change(screen.getByLabelText('Phòng ban'),{target:{value:'dept-hr'}});
    fireEvent.click(screen.getByRole('button',{name:'English'}));
    expect(screen.getByRole('heading',{name:'People'})).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveValue('Tên đang nhập');
    expect(screen.getByLabelText('Departments')).toHaveValue('dept-hr');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    fireEvent.click(screen.getByRole('button',{name:'Tiếng Việt'}));
    expect(screen.getByLabelText('Họ và tên')).toHaveValue('Tên đang nhập');
    expect(document.documentElement.lang).toBe('vi');
  });
  it('translates uppercase labels, counts and whitespace without guessing unknown content',()=>{
    expect(translateUi('NHÂN SỰ','en')).toBe('PEOPLE');
    expect(translateUi('  Lưu  ','en')).toBe('  Save  ');
    expect(translateUi('15 / trang','en')).toBe('15 / page');
    expect(translateUi('Còn 6 lĩnh vực cần nâng cấp','en')).toBe('6 domains need development');
    expect(translateUi('Nguyễn Văn Chủ','en')).toBe('Nguyễn Văn Chủ');
    expect(translateUi('Khóa đào tạo nội bộ do khách hàng nhập','en')).toBe('Khóa đào tạo nội bộ do khách hàng nhập');
    expect(translateUi('crs-A3-I','en')).toBe('crs-A3-I');
    expect(translateUi('Tên người','en')).toBe('Tên người');
    expect(translateUi('Save','vi')).toBe('Save');
    expect(translateUi(null,'en')).toBeNull();
  });
  it('syncs language between tabs and updates locale',()=>{
    render(<EditingScreen/>);
    act(()=>window.dispatchEvent(new StorageEvent('storage',{key:LANGUAGE_STORAGE_KEY,newValue:'en'})));
    expect(screen.getByRole('heading',{name:'People'})).toBeInTheDocument();
    expect(uiLocale()).toBe('en-GB');
    act(()=>window.dispatchEvent(new StorageEvent('storage',{key:LANGUAGE_STORAGE_KEY,newValue:null})));
    expect(uiLocale()).toBe('vi-VN');
  });
  it('works when browser storage is blocked',()=>{
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('Storage blocked');});
    expect(()=>useLanguageStore.getState().setLanguage('en')).not.toThrow();
    expect(useLanguageStore.getState().language).toBe('en');
  });
  it('localizes relative time while retaining invalid-date fallback',()=>{
    useLanguageStore.getState().setLanguage('en');
    expect(formatRelativeTime(new Date(Date.now()-5*60000).toISOString())).toBe('5 minutes ago');
    expect(formatRelativeTime('not-a-date')).toBe('—');
  });
  it('searches translated filter labels and submits the original status code',()=>{
    useLanguageStore.getState().setLanguage('en');
    const onChange=vi.fn();
    render(<OwnerFilterSelect label="Trạng thái" value="" options={[{value:'',label:'Tất cả'},{value:'ACTIVE',label:'Đang hoạt động'},{value:'INACTIVE',label:'Đã vô hiệu hóa'}]} onChange={onChange} onSearchChange={()=>{}}/>);
    fireEvent.click(screen.getByRole('combobox',{name:'Status'}));
    fireEvent.change(screen.getByPlaceholderText('Search this list'),{target:{value:'Active'}});
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.click(screen.getByRole('option',{name:'Active',exact:true}));
    expect(onChange).toHaveBeenCalledWith('ACTIVE');
  });
});
