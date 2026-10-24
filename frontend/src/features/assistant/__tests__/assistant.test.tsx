import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toHistory, useAssistantChatStore, type AssistantEntry } from '../../../hooks/use-assistant-chat';
import { cleanReply, sourceLabels } from '../assistant-format';
import { AssistantMarkdown } from '../components/AssistantMarkdown';
import { AssistantWidget } from '../components/AssistantWidget';
import { MOCK_EMAILS, signInAsMock, signOut } from '../../../test/session';

const entry = (role: AssistantEntry['role'], content: string, failed = false): AssistantEntry => ({ id: content, role, content, failed });

function renderWidget() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AssistantWidget />
    </QueryClientProvider>,
  );
}

describe('toHistory', () => {
  it('skips failed questions so turns keep alternating', () => {
    const history = toHistory([entry('user', 'a', true), entry('user', 'b'), entry('assistant', 'B'), entry('user', 'c')]);
    expect(history.map((t) => t.content)).toEqual(['b', 'B', 'c']);
  });

  it('keeps at most 40 turns and starts with the user', () => {
    const many: AssistantEntry[] = [];
    for (let i = 0; i < 50; i++) many.push(entry(i % 2 === 0 ? 'user' : 'assistant', `m${i}`));
    many.push(entry('user', 'last'));
    const history = toHistory(many);
    expect(history.length).toBeLessThanOrEqual(40);
    expect(history[0].role).toBe('user');
    expect(history[history.length - 1].content).toBe('last');
  });
});

describe('assistant-format', () => {
  it('drops the trailing source line written by the model', () => {
    const text = 'Có **4** nhân viên.\n\n_Nguồn: employees · phạm vi: toàn tổ chức · dữ liệu lúc 23/10/2026 13:24 (UTC)_\n';
    expect(cleanReply(text)).toBe('Có **4** nhân viên.');
    expect(cleanReply('Nguồn gốc dữ liệu ở đâu?\nTrả lời.')).toBe('Nguồn gốc dữ liệu ở đâu?\nTrả lời.');
  });

  it('shows only friendly labels and hides technical codes', () => {
    expect(sourceLabels(['users/employees (người dùng hiện tại)', 'courses', 'analytics:learning_progress', 'courses'])).toEqual([
      'Khóa học',
      'Thống kê học tập',
    ]);
  });
});

describe('AssistantMarkdown', () => {
  it('renders tables, lists and emphasis without injecting HTML', () => {
    const { container } = render(
      <AssistantMarkdown text={'**Tổng** <img src=x onerror=alert(1)>\n\n| Phòng | Số NV |\n|---|---|\n| Kế toán | 4 |\n\n- một\n- hai'} />,
    );
    expect(container.querySelector('strong')?.textContent).toBe('Tổng');
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
    expect(container.querySelectorAll('td')).toHaveLength(2);
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });
});

describe('AssistantWidget', () => {
  afterEach(() => {
    signOut();
    useAssistantChatStore.setState({ open: false, entries: [], ownerId: null });
  });

  it('shows the launcher for an employee with assistant.chat', () => {
    signInAsMock(MOCK_EMAILS.employee);
    renderWidget();
    expect(screen.getByRole('button', { name: 'Mở trợ lý AI' })).toBeInTheDocument();
  });

  it('is hidden without the permission', () => {
    signInAsMock(MOCK_EMAILS.employee, { permissions: [] });
    renderWidget();
    expect(screen.queryByRole('button', { name: 'Mở trợ lý AI' })).toBeNull();
  });
});
