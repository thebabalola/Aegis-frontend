import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) =>
    (key: string, params?: Record<string, unknown>) =>
      `${namespace ? namespace + '.' : ''}${key}` +
      (params ? ` ${JSON.stringify(params)}` : ''),
}));

import GovernancePage from './page';

describe('GovernancePage', () => {
  it('renders the governance heading', () => {
    render(<GovernancePage />);
    expect(screen.getByText(/governance.title/)).toBeInTheDocument();
  });

  it('renders placeholder proposal cards shaped like on-chain proposals', () => {
    render(<GovernancePage />);

    const cards = screen.getAllByTestId('proposal-card');
    expect(cards).toHaveLength(3);

    // Status chips cover pending, timelock and executed states
    expect(screen.getByText(/status_pending/)).toBeInTheDocument();
    expect(screen.getByText(/status_timelock/)).toBeInTheDocument();
    expect(screen.getByText(/status_executed/)).toBeInTheDocument();

    // Vote tally bars are present with aria labels
    const tallies = screen.getAllByRole('img');
    expect(tallies[0].getAttribute('aria-label')).toContain('governance.tally_aria');
  });
});
