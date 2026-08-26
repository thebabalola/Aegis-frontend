import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

type EventHandler = (data: { type?: string; action?: string }) => void;
let onEventHandler: EventHandler | null = null;
const joyrideState = { run: false, stepCount: 0 };

jest.mock('react-joyride', () => ({
  Joyride: (props: {
    run: boolean;
    steps: unknown[];
    onEvent?: EventHandler;
  }) => {
    joyrideState.run = props.run;
    joyrideState.stepCount = props.steps.length;
    onEventHandler = props.onEvent ?? null;
    return <div data-testid="joyride" data-run={String(props.run)} />;
  },
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import OnboardingTour from './OnboardingTour';

describe('OnboardingTour', () => {
  beforeEach(() => {
    localStorage.clear();
    joyrideState.run = false;
    joyrideState.stepCount = 0;
    onEventHandler = null;
  });

  it('runs for first-time visitors with all five steps', async () => {
    render(<OnboardingTour />);

    await waitFor(() => expect(joyrideState.run).toBe(true));
    expect(joyrideState.stepCount).toBe(5);
  });

  it('does not run after the onboarding flag is set', async () => {
    localStorage.setItem('aegis:onboarding-complete', '1');

    render(<OnboardingTour />);

    await waitFor(() => expect(screen.getByTestId('joyride')).toBeInTheDocument());
    expect(joyrideState.run).toBe(false);
  });

  it('persists dismissal when the tour ends or is skipped', async () => {
    render(<OnboardingTour />);
    await waitFor(() => expect(joyrideState.run).toBe(true));

    act(() => {
      onEventHandler?.({ type: 'tour:end' });
    });

    await waitFor(() => expect(joyrideState.run).toBe(false));
    expect(localStorage.getItem('aegis:onboarding-complete')).toBe('1');
  });
});
