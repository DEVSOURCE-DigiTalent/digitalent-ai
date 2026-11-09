import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrialTestPage } from '../pages/TrialTestPage';
const context=vi.hoisted(()=>({owner:true}));
vi.mock('@/hooks/use-current-user',()=>({useCurrentUser:(selector:(state:{user:{roles:string[]}})=>unknown)=>selector({user:{roles:context.owner?['OWNER']:['EMPLOYEE']}})}));
vi.mock('@/hooks/use-trial-program',()=>({useMyTrialAssessment:()=>({data:{status:'REVIEWED',organizationName:'Doanh nghiệp',levels:[2],domains:[{categoryId:'data',number:1,name:'Khai thác dữ liệu và thông tin'}]},isLoading:false})}));
vi.mock('../components/TrialExam',()=>({TrialExam:()=>null}));
afterEach(cleanup);
describe('survey results context',()=>{
  it('shows a management back link and results without a learning path for the owner',()=>{
    context.owner=true;
    render(<MemoryRouter><TrialTestPage/></MemoryRouter>);
    expect(screen.getByRole('link',{name:'← Đánh giá đội ngũ'})).toHaveAttribute('href','/enterprise/trial');
    expect(screen.getByRole('heading',{name:'Kết quả khảo sát của tôi'})).toBeInTheDocument();
    expect(screen.queryByRole('link',{name:/Xem lộ trình học tập/})).not.toBeInTheDocument();
  });
  it('preserves the learning path for employee accounts',()=>{
    context.owner=false;
    render(<MemoryRouter><TrialTestPage/></MemoryRouter>);
    expect(screen.getByRole('link',{name:/Xem lộ trình học tập/})).toBeInTheDocument();
  });
});
