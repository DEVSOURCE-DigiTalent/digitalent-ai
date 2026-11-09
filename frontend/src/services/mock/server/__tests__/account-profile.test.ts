import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockDb } from '../../mock-store';
import { dispatch } from '../router';
import { composeSession } from '../session';
import '../handlers';
const call=(method:string,body:Record<string,unknown>={})=>dispatch({method,path:'/account/profile',body,query:{},userId:'mock-owner'});
describe('demo account profile persistence',()=>{
  beforeEach(()=>{localStorage.clear();resetMockDb();});
  it('keeps profile edits on the next read and refreshes the session display name',async()=>{
    const values={fullName:'Nguyễn Minh Anh',phone:'0901234567',jobTitle:'Giám đốc'};
    expect((await call('PUT',values)).status).toBe(200);
    const read=await call('GET');
    expect((read.body as {data:unknown}).data).toMatchObject(values);
    expect(composeSession('mock-owner')?.fullName).toBe(values.fullName);
  });
});
