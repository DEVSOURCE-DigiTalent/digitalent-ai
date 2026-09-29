import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { AppProviders } from '../providers';

describe('AppProviders', () => {
  it('mounts a toaster so toast messages are visible to the user', async () => {
    render(<AppProviders />);

    act(() => {
      toast.error("Department code 'OPS' already exists.");
    });

    expect(await screen.findByText("Department code 'OPS' already exists.")).toBeInTheDocument();
  });
});
