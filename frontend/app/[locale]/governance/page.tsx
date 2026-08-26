'use client';

import { Vote } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Placeholder layout for the governance/voting features (#98).
 *
 * The volatility_shield contract now exposes multisig governance
 * (guardian approvals, weighted voting, timelock — see Aegis-contract
 * 2df204f). These cards mirror that proposal shape with static sample
 * data; live contract reads land once the governance client is wired.
 */

type ProposalStatus = 'pending' | 'timelock' | 'executed';

interface SampleProposal {
  id: number;
  actionLabel: string;
  proposer: string;
  guardianApprovals: number;
  guardianThreshold: number;
  yesVotes: string;
  noVotes: string;
  status: ProposalStatus;
}

// Static sample data shaped like the on-chain Proposal + VoteTally structs.
const PLACEHOLDER_PROPOSALS: SampleProposal[] = [
  {
    id: 3,
    actionLabel: 'Pause Vault',
    proposer: 'GAAZI4TC…WN7K',
    guardianApprovals: 2,
    guardianThreshold: 3,
    yesVotes: '42,500',
    noVotes: '8,200',
    status: 'timelock',
  },
  {
    id: 2,
    actionLabel: 'Change Threshold to 2',
    proposer: 'GCEZWKCA…M9XQ',
    guardianApprovals: 1,
    guardianThreshold: 3,
    yesVotes: '18,000',
    noVotes: '21,400',
    status: 'pending',
  },
  {
    id: 1,
    actionLabel: 'Unpause Vault',
    proposer: 'GBSC7D3T…ZSOL',
    guardianApprovals: 3,
    guardianThreshold: 3,
    yesVotes: '96,100',
    noVotes: '4,050',
    status: 'executed',
  },
];

const STATUS_STYLES: Record<ProposalStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  timelock: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  executed: 'bg-green-500/10 text-green-500 border-green-500/30',
};

function truncateAddress(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function GovernancePage() {
  const t = useTranslations('governance');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-1">
          <Vote className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">{t('subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="proposal-grid">
          {PLACEHOLDER_PROPOSALS.map((proposal) => {
            const totalVotes = Number(proposal.yesVotes.replace(',', '')) +
              Number(proposal.noVotes.replace(',', ''));
            const yesPct = totalVotes > 0
              ? Math.round((Number(proposal.yesVotes.replace(',', '')) / totalVotes) * 100)
              : 0;

            return (
              <article
                key={proposal.id}
                data-testid="proposal-card"
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground">#{proposal.id}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[proposal.status]}`}>
                    {t(`status_${proposal.status}`)}
                  </span>
                </div>

                <h2 className="font-bold text-lg mb-1">{proposal.actionLabel}</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  {t('proposed_by')} {truncateAddress(proposal.proposer)}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>
                    {t('guardian_approvals')}: {proposal.guardianApprovals}/{proposal.guardianThreshold}
                  </span>
                  <span>{t('vote_tally')}</span>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden flex" role="img"
                  aria-label={t('tally_aria', { yes: proposal.yesVotes, no: proposal.noVotes })}>
                  <div className="bg-green-500 h-full" style={{ width: `${yesPct}%` }} />
                  <div className="bg-red-500/70 h-full" style={{ width: `${100 - yesPct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span className="text-green-500">✓ {proposal.yesVotes}</span>
                  <span className="text-red-400/80">✗ {proposal.noVotes}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
