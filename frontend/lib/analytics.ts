/**
 * Privacy-first analytics module
 *
 * Tracks key user actions with full privacy respect:
 * - Respects browser's doNotTrack setting
 * - Respects user's opt-out preference in localStorage
 * - Never sends wallet addresses or personal identifiable information
 * - Uses hashed identifiers instead of raw addresses
 */

const ANALYTICS_KEY = 'xhedge-analytics-enabled';
const ANALYTICS_PROVIDER = 'https://analytics.example.com'; // Replace with actual provider

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

function isAnalyticsEnabled(): boolean {
  const doNotTrack = navigator.doNotTrack || (window as any).doNotTrack;
  if (doNotTrack === '1' || doNotTrack === 'yes') {
    return false;
  }

  try {
    const analyticsDisabled = localStorage.getItem(ANALYTICS_KEY);
    if (analyticsDisabled === 'false') {
      return false;
    }
  } catch {
    // localStorage may not be available
  }

  return true;
}

function getSessionId(): string {
  const key = 'xhedge-session-id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 11);
    try {
      sessionStorage.setItem(key, sessionId);
    } catch {
      // sessionStorage may not be available
    }
  }
  return sessionId;
}

export async function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const event: AnalyticsEvent = {
    eventName,
    properties: {
      ...properties,
      url: window.location.pathname,
      referrer: document.referrer || 'direct',
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  try {
    const payload = {
      ...event,
      sessionId: getSessionId(),
    };

    if (ANALYTICS_PROVIDER && ANALYTICS_PROVIDER !== 'https://analytics.example.com') {
      await fetch(`${ANALYTICS_PROVIDER}/api/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Silently fail - analytics errors should not break the app
      });
    }
  } catch {
    // Silently fail
  }
}

export function trackWalletConnected(network?: string): void {
  trackEvent('wallet_connected', {
    network: network || 'unknown',
  });
}

export function trackWalletDisconnected(): void {
  trackEvent('wallet_disconnected');
}

export function trackDepositSubmitted(amount?: string, asset?: string): void {
  trackEvent('deposit_submitted', {
    asset: asset || 'unknown',
    hasAmount: !!amount && amount !== '0',
  });
}

export function trackWithdrawSubmitted(amount?: string, asset?: string): void {
  trackEvent('withdraw_submitted', {
    asset: asset || 'unknown',
    hasAmount: !!amount && amount !== '0',
  });
}

export function trackVoteCast(proposalType?: string, vote?: 'for' | 'against'): void {
  trackEvent('vote_cast', {
    proposalType: proposalType || 'unknown',
    vote: vote || 'unknown',
  });
}

export function trackLanguageChanged(language?: string): void {
  trackEvent('language_changed', {
    language: language || 'unknown',
  });
}

export function trackNetworkSwitched(network?: string): void {
  trackEvent('network_switched', {
    network: network || 'unknown',
  });
}

export function trackSettingsChanged(setting?: string, value?: boolean): void {
  trackEvent('settings_changed', {
    setting: setting || 'unknown',
    enabled: value !== undefined ? value : false,
  });
}

export function setAnalyticsPreference(enabled: boolean): void {
  try {
    localStorage.setItem(ANALYTICS_KEY, enabled ? 'true' : 'false');
  } catch {
    // localStorage may not be available
  }
}

export function getAnalyticsPreference(): boolean {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (stored === 'false') {
      return false;
    }
    if (stored === 'true') {
      return true;
    }
  } catch {
    // localStorage may not be available
  }

  return isAnalyticsEnabled();
}
