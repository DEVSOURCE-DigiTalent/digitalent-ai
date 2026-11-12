import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Building2, Globe2, Timer, Save, LockKeyhole, RotateCcw } from 'lucide-react';
import { useOrganization, useUpdateOrganizationSettings } from '@/hooks/use-organization';
import { ORGANIZATION_INDUSTRIES, ORGANIZATION_SIZES } from '@/lib/reference-positions';
import { apiErrorMessage } from '@/lib/utils';
import { AccountWorkspace } from '@/features/account/components/AccountWorkspace';
const TIMEZONES=[{value:'Asia/Ho_Chi_Minh',label:'Việt Nam (UTC+7)'},{value:'Asia/Bangkok',label:'Bangkok (UTC+7)'},{value:'Asia/Singapore',label:'Singapore (UTC+8)'},{value:'UTC',label:'UTC'}];
const schema=z.object({name:z.string().trim().min(2,'Tên tổ chức cần ít nhất 2 ký tự'),industry:z.string().min(1,'Chọn ngành hoạt động'),size:z.string().min(1,'Chọn quy mô'),timezone:z.string().min(1,'Chọn múi giờ'),defaultAssignmentDays:z.coerce.number().int('Nhập số ngày nguyên').min(1,'Ít nhất 1 ngày').max(365,'Tối đa 365 ngày')});
type FormValues=z.input<typeof schema>;
export function OrganizationSettingsPage(){
  useUiLanguage();
  const {data,isLoading,isError,refetch}=useOrganization();const save=useUpdateOrganizationSettings();
  const {register,handleSubmit,reset,watch,formState:{errors,isDirty}}=useForm<FormValues>({resolver:zodResolver(schema)});
  useEffect(()=>{if(data)reset({name:data.name,industry:data.industry,size:data.size,timezone:data.timezone,defaultAssignmentDays:data.defaultAssignmentDays});},[data,reset]);
  const onSubmit=handleSubmit(async values=>{try{const parsed=schema.parse(values);await save.mutateAsync(parsed);reset(parsed);toast.success(translateUi('Đã lưu cài đặt tổ chức.'));}catch(error){toast.error(apiErrorMessage(error,'Không lưu được cài đặt tổ chức.'));}});
  const days=Number(watch('defaultAssignmentDays'));
  return <AccountWorkspace title={translateUi("Cài đặt tổ chức")} section="organization">
    {isLoading?<div className="aw-card aw-state" role="status">{translateUi("Đang tải cài đặt tổ chức…")}</div>:isError||!data?<div className="aw-alert aw-alert--error" role="alert">{translateUi("Không tải được cài đặt tổ chức. ")}<button onClick={()=>void refetch()}>{translateUi("Thử lại")}</button></div>:<>
      <section className="aw-org-banner"><span className="aw-org-mark"><Building2 size={30}/></span><div><span className="aw-eyebrow">{translateUi("TỔ CHỨC CỦA BẠN")}</span><h2>{data.name}</h2></div>{data.ownerName&&<div className="aw-org-owner"><span>{translateUi("Chủ doanh nghiệp")}</span><strong>{data.ownerName}</strong></div>}</section>
      <form onSubmit={onSubmit} noValidate className="aw-org-form">
        <section className="aw-card"><div className="aw-section-title"><span className="aw-icon"><Building2 size={20}/></span><div><h2>{translateUi("Thông tin doanh nghiệp")}</h2><p>{translateUi("Thông tin sử dụng trong không gian làm việc.")}</p></div></div>
          <div className="aw-org-fields"><label className="aw-field" htmlFor="org-name">{translateUi("Tên tổ chức")}<span className="aw-input-icon"><LockKeyhole size={15}/><input id="org-name" readOnly aria-invalid={!!errors.name} {...register('name')}/></span><small>{translateUi("Tên tổ chức đã được xác lập khi đăng ký.")}</small>{errors.name&&<span className="aw-field-error" role="alert">{translateUi(errors.name.message)}</span>}</label>
            <label className="aw-field" htmlFor="org-industry">{translateUi("Ngành hoạt động")}<select id="org-industry" aria-invalid={!!errors.industry} {...register('industry')}>{ORGANIZATION_INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}</select>{errors.industry&&<span className="aw-field-error" role="alert">{translateUi(errors.industry.message)}</span>}</label>
            <label className="aw-field" htmlFor="org-size">{translateUi("Quy mô nhân sự")}<select id="org-size" aria-invalid={!!errors.size} {...register('size')}>{ORGANIZATION_SIZES.map(s=><option key={s.value} value={s.value}>{translateUi(s.label)}</option>)}</select>{errors.size&&<span className="aw-field-error" role="alert">{translateUi(errors.size.message)}</span>}</label>
          </div>
        </section>
        <section className="aw-card aw-org-defaults"><div className="aw-section-title"><span className="aw-icon aw-icon--amber"><Globe2 size={20}/></span><div><h2>{translateUi("Thiết lập vận hành")}</h2><p>{translateUi("Giá trị mặc định cho hoạt động đào tạo.")}</p></div></div>
          <label className="aw-field" htmlFor="org-timezone">{translateUi("Múi giờ")}<select id="org-timezone" {...register('timezone')}>{TIMEZONES.map(z=><option key={z.value} value={z.value}>{translateUi(z.label)}</option>)}</select>{errors.timezone&&<span className="aw-field-error" role="alert">{translateUi(errors.timezone.message)}</span>}</label>
          <div className="aw-deadline-preview"><Timer size={25}/><div><strong>{Number.isFinite(days)&&days>=1&&days<=365?days:'—'}<small>{translateUi("ngày")}</small></strong><span>{translateUi("Thời hạn hoàn thành khóa học")}</span></div></div>
          <label className="aw-field" htmlFor="org-days">{translateUi("Số ngày mặc định")}<input id="org-days" type="number" min={1} max={365} aria-invalid={!!errors.defaultAssignmentDays} aria-describedby="org-days-hint" {...register('defaultAssignmentDays')}/><small id="org-days-hint">{translateUi("Áp dụng khi giao khóa học mà không chọn thời hạn riêng.")}</small>{errors.defaultAssignmentDays&&<span className="aw-field-error" role="alert">{translateUi(errors.defaultAssignmentDays.message)}</span>}</label>
        </section>
        <footer className="aw-actions aw-org-actions"><span role="status">{isDirty?translateUi('Có thay đổi chưa được lưu'):translateUi('Cài đặt đang được áp dụng')}</span><div><button type="button" className="aw-secondary" disabled={!isDirty||save.isPending} onClick={()=>reset()}><RotateCcw size={15}/>{translateUi("Hoàn tác")}</button><button type="submit" className="aw-primary" disabled={!isDirty||save.isPending}><Save size={16}/>{save.isPending?translateUi('Đang lưu…'):translateUi('Lưu cài đặt')}</button></div></footer>
      </form>
    </>}
  </AccountWorkspace>;
}
