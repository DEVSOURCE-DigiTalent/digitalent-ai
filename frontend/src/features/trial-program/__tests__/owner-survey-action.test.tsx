import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { OwnerSurveyAction } from '../components/OwnerSurveyAction';
import type { TrialProgram } from '@/services/trial-program.service';

const join=vi.hoisted(()=>vi.fn().mockResolvedValue({refreshed:true}));
vi.mock('@/hooks/use-trial-program',()=>({useJoinTrialAsParticipant:()=>({isPending:false,mutateAsync:join})}));
vi.mock('@/hooks/use-current-user',()=>({useCurrentUser:(selector:(state:{user:{roles:string[]}})=>unknown)=>selector({user:{roles:['OWNER']}})}));
afterEach(()=>{cleanup();join.mockClear();});
const program:TrialProgram={organizationId:'org',organizationName:'Doanh nghiệp',stage:'REQUESTED',maxParticipants:30,choiceCount:18,essayCount:0,participants:[],departments:['CEO'],positions:['Giám đốc']};
function Location(){return <output aria-label="Địa chỉ">{useLocation().pathname}</output>;}

describe('owner joins the employee survey',()=>{
  it('confirms placement and goes directly to the shared employee assessment after joining',async()=>{
    render(<MemoryRouter initialEntries={['/enterprise/trial']}><OwnerSurveyAction program={program}/><Location/></MemoryRouter>);
    fireEvent.click(screen.getByRole('button',{name:'Tôi cũng tham gia'}));
    expect(join).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:/Đăng ký & vào bài khảo sát/}));
    await waitFor(()=>expect(screen.getByLabelText('Địa chỉ')).toHaveTextContent('/enterprise/me/trial-test'));
    expect(join).toHaveBeenCalledWith({department:'CEO',position:'Giám đốc'});
  });
  it('does not register an additional owner after the survey is finalized',()=>{
    render(<MemoryRouter><OwnerSurveyAction program={{...program,stage:'REPORTED'}}/></MemoryRouter>);
    expect(screen.queryByRole('button',{name:'Tôi cũng tham gia'})).not.toBeInTheDocument();
    expect(join).not.toHaveBeenCalled();
  });
});
