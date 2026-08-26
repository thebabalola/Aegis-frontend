'use client';

import { useCallback, useEffect, useState } from 'react';
import { Joyride, type Step } from 'react-joyride';
import { useTranslations } from 'next-intl';

const ONBOARDING_FLAG = 'aegis:onboarding-complete';

interface TourStep {
	target: string;
	content: string;
	disableBeacon: boolean;
}

export default function OnboardingTour() {
	const t = useTranslations('onboarding');
	const [run, setRun] = useState(false);

	useEffect(() => {
		try {
			if (!localStorage.getItem(ONBOARDING_FLAG)) {
				setRun(true);
			}
		} catch {
			// localStorage unavailable — skip the tour rather than nag every load.
		}
	}, []);

	const dismiss = useCallback(() => {
		try {
			localStorage.setItem(ONBOARDING_FLAG, '1');
		} catch {
			// ignore
		}
		setRun(false);
	}, []);

	// Steps target data-tour anchors placed on existing dashboard sections.
	const themeOptions = {
		backgroundColor: '#111318',
		textColor: '#e5e7eb',
		arrowColor: '#111318',
		overlayColor: 'rgba(0, 0, 0, 0.65)',
		primaryColor: '#22d3ee',
		spotlightPadding: 8,
		zIndex: 200,
	};

	const steps: Step[] = (
		[
			['nav-tabs', t('step_nav')],
			['vault-overview', t('step_vault_overview')],
			['risk-forecast', t('step_risk_forecast')],
			['vault-cards', t('step_vault_cards')],
			['bridge-link', t('step_bridge')],
		] as const
	).map(([target, content]) => ({
		target: `[data-tour="${target}"]`,
		content,
		disableBeacon: true,
		options: themeOptions,
	}));

	return (
		<Joyride
			steps={steps}
			run={run}
			onEvent={(data) => {
				if (data.type === 'tour:end' || data.action === 'close') {
					dismiss();
				}
			}}
			styles={{
				buttonPrimary: { backgroundColor: '#22d3ee', color: '#06121a', borderRadius: 10 },
				buttonBack: { color: '#9ca3af' },
				buttonSkip: { color: '#6b7280' },
			}}
		/>
	);
}
