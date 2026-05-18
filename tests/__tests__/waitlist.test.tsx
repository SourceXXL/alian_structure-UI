import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PremiumWaitlist from '@/app/waitlist/page';
import { StellarWalletProvider } from '@/components/context/StellarWalletProvider';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

// Mock useTranslation
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PremiumWaitlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the waitlist form', () => {
    render(
      <StellarWalletProvider>
        <PremiumWaitlist />
      </StellarWalletProvider>
    );

    expect(screen.getByPlaceholderText('waitlist.emailPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('waitlist.joinButton')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Successfully added', position: 1 }),
    });

    render(
      <StellarWalletProvider>
        <PremiumWaitlist />
      </StellarWalletProvider>
    );

    const input = screen.getByPlaceholderText('waitlist.emailPlaceholder');
    const button = screen.getByText('waitlist.joinButton');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('waitlist.success.title')).toBeInTheDocument();
      expect(screen.getByText('Position: #1')).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email already registered' }),
    });

    render(
      <StellarWalletProvider>
        <PremiumWaitlist />
      </StellarWalletProvider>
    );

    const input = screen.getByPlaceholderText('waitlist.emailPlaceholder');
    const button = screen.getByText('waitlist.joinButton');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
