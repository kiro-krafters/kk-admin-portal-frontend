import { MOCK_LEX_BOTS } from '../../mock/contactLens';
import SectionCard from '../../components/shared/SectionCard';

export default function LexBotSection() {
  return (
    <SectionCard
      icon="🤖"
      iconVariant="amber"
      title="Amazon Lex Bot Configuration"
      subtitle="Manage intents, locales, and bot aliases for kk_lexbot_dev"
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {MOCK_LEX_BOTS.map(bot => (
          <div key={bot.lang} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            {/* Bot header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-base shadow-sm">
                {bot.flag}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{bot.lang}</div>
                <div className="text-[11px] text-slate-400">{bot.alias} · v1.0</div>
              </div>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  bot.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {bot.status === 'active' ? '● Active' : '○ Inactive'}
              </span>
            </div>

            {/* Intents */}
            <div className="space-y-2">
              {bot.intents.map(intent => {
                const isEN = bot.lang.includes('English');
                return (
                  <div
                    key={intent.name}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">⚡</span>
                      <span className="text-xs font-semibold text-slate-800">{intent.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          isEN
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isEN ? 'EN' : 'ES'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${Math.min(100, (intent.hits / 200) * 100)}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[11px] text-slate-400">
                        {intent.hits} hits
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
