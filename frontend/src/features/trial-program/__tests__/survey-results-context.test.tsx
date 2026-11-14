import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrialTestPage } from '../pages/TrialTestPage';
const context=vi.hoisted(()=>({owner:true, awaitingFramework:false, published:true, status:"REVIEWED", canStart:false, refetch:vi.fn()}));
vi.mock('@/hooks/use-current-user',()=>({useCurrentUser:(selector:(state:{user:{roles:string[]}})=>unknown)=>selector({user:{roles:context.owner?['OWNER']:['EMPLOYEE']}})}));
vi.mock('@/hooks/use-trial-program',()=>({useMyTrialAssessment:()=>({data:{status:context.status,canStart:context.canStart,closedMessage:'Đã hết hạn khảo sát',choiceCount:18,reportPublished:context.published,choiceScore:17,choiceTotal:18,organizationName:'Doanh nghiệp',levels:[2],domains:[{categoryId:'data',number:1,name:'Khai thác dữ liệu và thông tin'}]},isLoading:false,refetch:context.refetch})}));
vi.mock('@/hooks/use-pulse',()=>({usePulseOverview:()=>({data:{hasPosition:true,hasTargets:!context.awaitingFramework,awaitingFramework:context.awaitingFramework}})}));
vi.mock('../components/TrialExam',()=>({TrialExam:()=>null}));
afterEach(() => {
  cleanup();
  context.owner = true;
  context.awaitingFramework = false;
  context.published = true;
  context.status = 'REVIEWED';
  context.canStart = false;
  context.refetch.mockClear();
});
describe('survey results context',()=>{
  it('shows a management back link and results without a learning path for the owner',()=>{
    context.owner=true;
    render(<MemoryRouter><TrialTestPage/></MemoryRouter>);
    expect(screen.getByRole('link',{name:'← Đánh giá đội ngũ'})).toHaveAttribute('href','/enterprise/trial');
    expect(screen.getByRole('heading',{name:'Kết quả khảo sát của tôi'})).toBeInTheDocument();
    expect(screen.queryByRole('link',{name:/Về Tổng quan/})).not.toBeInTheDocument();
  });
  it('preserves the learning path for employee accounts',()=>{
    context.owner=false;
    render(<MemoryRouter><TrialTestPage/></MemoryRouter>);
    expect(screen.getByRole('link',{name:/Về Tổng quan/})).toHaveAttribute('href', '/enterprise/me');
  });
  it('shows results and trial courses while the employee waits for the framework',()=>{
    context.owner=false;
    context.awaitingFramework=true;
    context.published=false;
    render(<MemoryRouter><TrialTestPage/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'Kết quả khảo sát của tôi'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:/Xem khóa học thử/})).toHaveAttribute('href', '/enterprise/me/path');
    expect(screen.getByText('17/18')).toBeInTheDocument();
    expect(screen.queryByRole('link',{name:/Về Tổng quan/})).not.toBeInTheDocument();
  });
});

it('restores the employee intro and respects the server flag for entering the exam', () => {
  context.owner = false;
  context.status = 'NOT_STARTED';
  const view = render(<MemoryRouter><TrialTestPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Đánh giá 6 lĩnh vực năng lực số đầu vào' })).toBeInTheDocument();
  expect(screen.getByText('Đã hết hạn khảo sát')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Vào phòng thi/ })).not.toBeInTheDocument();
  context.canStart = true;
  view.rerender(<MemoryRouter><TrialTestPage /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /Vào phòng thi/ })).toHaveAttribute('href', '/enterprise/me/trial-test/exam');
});

it('refreshes the employee waiting panel using the existing assessment query', () => {
  context.owner = false;
  context.status = 'SUBMITTED';
  render(<MemoryRouter><TrialTestPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Đã nộp bài đánh giá năng lực số' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Làm mới trạng thái' }));
  expect(context.refetch).toHaveBeenCalledOnce();
});
