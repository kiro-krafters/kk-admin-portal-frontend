import { MOCK_LEX_BOTS } from '../../mock/contactLens';
import SectionCard from '../../components/shared/SectionCard';

const TOTAL_INVOCATIONS = MOCK_LEX_BOTS.reduce(
  (sum, bot) => sum + bot.intents.reduce((s, i) => s + i.hits, 0),
  0,
);

export default function LexBotSection() {
  return (
    <SectionCard
      icon="🤖"
      iconVariant="amber"
      title="Lex Bot Overview"
      subtitle="kk_lexbot_dev · kk_lexalias_dev — read-only (invocation counts from CloudWatch)"
    >
      {/* Bot summary row */}
      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-lg border border-connect-border bg-connect-bg-soft px-4 py-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">Bot Name</div>
          <div className="font-mono text-sm font-semibold text-connect-text">kk_lexbot_dev</div>
        </div>
        <div className="h-8 w-px bg-connect-border" />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">Alias</div>
          <div className="font-mono text-sm font-semibold text-connect-text">kk_lexalias_dev</div>
        </div>
        <div className="h-8 w-px bg-connect-border" />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">Status</div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-connect-success" />
            <span className="text-sm font-semibold text-connect-success">Active</span>
          </div>
        </div>
        <div className="h-8 w-px bg-connect-border" />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-connect-text-secondary">Total Invocations</div>
          <div className="text-sm font-semibold text-connect-text">{TOTAL_INVOCATIONS.toLocaleString()}</div>
        </div>
        <div className="ml-auto">
          <span className="rounded-md bg-connect-warning-soft px-2.5 py-1 text-[11px] font-semibold text-connect-warning">
            Read-only · CloudWatch source
          </span>
        </div>
      </div>

      {/* Per-locale intent breakdown */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {MOCK_LEX_BOTS.map(bot => {
          const botTotal = bot.intents.reduce((s, i) => s + i.hits, 0);
          const isEN = bot.lang.includes('English');
          return (
            <div key={bot.lang} className="rounded-xl border border-connect-border bg-connect-bg-soft p-5">
              {/* Bot locale header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-connect-hero text-base shadow-sm">
                  {bot.flag}
                </div>
                <div>
                  <div className="text-sm font-semibold text-connect-text">{bot.lang}</div>
                  <div className="font-mono text-[11px] text-connect-text-secondary">{bot.alias}</div>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isEN ? 'bg-connect-teal-soft text-connect-teal-dark' : 'bg-connect-purple-soft text-connect-purple'
                  }`}>
                    {isEN ? 'EN' : 'ES'}
                  </span>
                  <span className="mt-0.5 text-[11px] text-connect-text-secondary">{botTotal} invocations</span>
                </div>
              </div>

              {/* Intents with invocation bar */}
              <div className="space-y-2.5">
                {bot.intents.map(intent => {
                  const pct = Math.round((intent.hits / Math.max(botTotal, 1)) * 100);
                  return (
                    <div key={intent.name} className="rounded-md border border-connect-border bg-connect-bg px-3 py-2.5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-connect-text">{intent.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-connect-text-secondary">
                          {intent.hits} hits · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-connect-bg-alt">
                        <div
                          className="h-full rounded-full bg-connect-warning transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
