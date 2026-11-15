import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountProfilePage } from '../pages/AccountProfilePage';
import { SecuritySettingsPage } from '../pages/SecuritySettingsPage';
import { OrganizationSettingsPage } from '@/features/organization/pages/OrganizationSettingsPage';
const state=vi.hoisted(()=>({roles:['OWNER'],sessions:[] as Array<{id:string;timestamp:string;browser:string;status:string}>,profile:{id:'owner',fullName:'Nguyễn Văn Chủ',email:'owner@example.test',phone:'',jobTitle:'Giám đốc'},org:{id:'org',name:'DigiTalent',ownerName:'Nguyễn Văn Chủ',industry:'Công nghệ thông tin',size:'11-50',timezone:'Asia/Ho_Chi_Minh',defaultAssignmentDays:30},profileSave:vi.fn().mockResolvedValue({}),passwordSave:vi.fn().mockResolvedValue({}),orgSave:vi.fn().mockResolvedValue({})}));
vi.mock('@/hooks/use-current-user',()=>({useCurrentUser:(selector:(s:{user:{id:string;fullName:string;email:string;roles:string[]}})=>unknown)=>selector({user:{id:'owner',fullName:'Nguyễn Văn Chủ',email:'owner@example.test',roles:state.roles}})}));
vi.mock('@/hooks/use-platform',()=>({useUserProfile:()=>({data:state.profile,isLoading:false,isError:false}),useUpdateUserProfile:()=>({mutateAsync:state.profileSave,isPending:false}),useChangePassword:()=>({mutateAsync:state.passwordSave,isPending:false}),useLoginHistory:()=>({data:state.sessions,isLoading:false,isError:false,isFetching:false,refetch:vi.fn()})}));
vi.mock('@/hooks/use-organization',()=>({useOrganization:()=>({data:state.org,isLoading:false,isError:false,refetch:vi.fn()}),useUpdateOrganizationSettings:()=>({mutateAsync:state.orgSave,isPending:false})}));
afterEach(()=>{cleanup();vi.clearAllMocks();state.roles=['OWNER'];state.sessions=[];});
const mount=(node:React.ReactNode,path:string)=>render(<MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>);
describe('owner account workspace',()=>{
  it('saves trimmed profile fields and keeps the login email read-only',async()=>{
    mount(<AccountProfilePage/>,'/enterprise/account');
    expect(screen.getByLabelText(/Email đăng nhập/)).toHaveAttribute('readonly');
    expect(screen.getByRole('link',{name:'Cài đặt tổ chức'})).toHaveAttribute('href','/enterprise/settings');
    fireEvent.change(screen.getByLabelText('Họ và tên'),{target:{value:'  Nguyễn Minh Anh  '}});
    fireEvent.click(screen.getByRole('button',{name:'Lưu thông tin'}));
    await waitFor(()=>expect(state.profileSave).toHaveBeenCalledWith({fullName:'Nguyễn Minh Anh',phone:'',jobTitle:'Giám đốc'}));
    expect(await screen.findByRole('status')).toHaveTextContent('Đã lưu thông tin cá nhân.');
  });
  it('rejects a mismatched password confirmation without calling the API',async()=>{
    mount(<SecuritySettingsPage/>,'/enterprise/account/security');
    fireEvent.change(screen.getByLabelText('Mật khẩu hiện tại'),{target:{value:'Current123!'}});
    fireEvent.change(screen.getByLabelText('Mật khẩu mới',{exact:true}),{target:{value:'NextPassword123!'}});
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu mới'),{target:{value:'Mismatch123!'}});
    fireEvent.click(screen.getByRole('button',{name:'Cập nhật mật khẩu'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Mật khẩu xác nhận không khớp.');
    expect(state.passwordSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('button',{name:'Đăng xuất các thiết bị khác'})).not.toBeInTheDocument();
  });
  it('submits a matching password and clears sensitive fields after success',async()=>{
    mount(<SecuritySettingsPage/>,'/enterprise/account/security');
    fireEvent.change(screen.getByLabelText('Mật khẩu hiện tại'),{target:{value:'Current123!'}});
    fireEvent.change(screen.getByLabelText('Mật khẩu mới',{exact:true}),{target:{value:'NextPassword123!'}});
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu mới'),{target:{value:'NextPassword123!'}});
    fireEvent.click(screen.getByRole('button',{name:'Cập nhật mật khẩu'}));
    await waitFor(()=>expect(state.passwordSave).toHaveBeenCalledWith({currentPassword:'Current123!',newPassword:'NextPassword123!'}));
    await waitFor(()=>expect(screen.getByLabelText('Mật khẩu mới',{exact:true})).toHaveValue(''));
  });
  it('validates organization deadlines before saving and supports reverting a draft',async()=>{
    mount(<OrganizationSettingsPage/>,'/enterprise/settings');
    const days=screen.getByLabelText(/Số ngày mặc định/);
    fireEvent.change(days,{target:{value:'0'}});
    fireEvent.click(screen.getByRole('button',{name:'Lưu cài đặt'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ít nhất 1 ngày');
    expect(state.orgSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Hoàn tác'}));
    await waitFor(()=>expect(days).toHaveValue(30));
    fireEvent.change(days,{target:{value:'45'}});
    fireEvent.click(screen.getByRole('button',{name:'Lưu cài đặt'}));
    await waitFor(()=>expect(state.orgSave).toHaveBeenCalledWith(expect.objectContaining({defaultAssignmentDays:45,name:'DigiTalent'})));
  });
});

it('uses the enterprise security layout and expands the login history for a manager', () => {
  state.roles = ['MANAGER'];
  state.sessions = Array.from({ length: 6 }, (_, index) => ({
    id: String(index), timestamp: new Date(Date.UTC(2026, 10, index + 1)).toISOString(), browser: 'Chrome', status: 'SUCCESS',
  }));
  mount(<SecuritySettingsPage />, '/enterprise/account/security');
  expect(screen.getByRole('heading', { name: 'Bảo mật tài khoản' })).toBeInTheDocument();
  expect(screen.getAllByText('Thành công')).toHaveLength(5);
  fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }));
  expect(screen.getAllByText('Thành công')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button', { name: 'Thu gọn' }));
  expect(screen.getAllByText('Thành công')).toHaveLength(5);
});
