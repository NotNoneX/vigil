import { useEffect, useMemo, useRef, useState } from 'react';
import { Ghost } from './components/Ghost';
import {
  MAX_HAUNT,
  SESSION_LENGTHS,
  abandon,
  createSession,
  dread,
  formatClock,
  longestStretch,
  pause,
  progress,
  remainingSeconds,
  resume,
  tick,
  verdict,
  visit,
  type SessionLength,
  type SessionState,
} from './lib/session';

type Phase = 'setup' | 'running' | 'over';

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [minutes, setMinutes] = useState<SessionLength>(25);
  const [intention, setIntention] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [pulse, setPulse] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 计时器：只在 running 时挂载，避免暂停后空转。
  useEffect(() => {
    if (session?.status !== 'running') return;
    const id = window.setInterval(() => {
      setSession((s) => {
        if (!s) return s;
        const next = tick(s);
        if (next.status === 'done') setPhase('over');
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [session?.status]);

  // 怨气值写进 CSS 变量，驱动整个房间的明暗。
  const level = session ? dread(session) : 0;
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--dread', String(level));
    root.style.setProperty('--lamp', String(Math.max(0.18, 1 - level / 130)));
  }, [level]);

  // 幽灵逼近时让屏幕轻微一震。
  const haunt = session?.haunt ?? 0;
  useEffect(() => {
    if (haunt > 0) setPulse((n) => n + 1);
  }, [haunt]);

  // 标题同步剩余时间，切到别的窗口也能看见。
  useEffect(() => {
    if (session?.status === 'running') {
      document.title = `${formatClock(remainingSeconds(session))} · Vigil`;
    } else if (phase === 'over') {
      document.title = 'Vigil — the night is over';
    } else {
      document.title = 'Vigil — keep the candle burning';
    }
  }, [session, phase]);

  const start = () => {
    const trimmed = intention.trim();
    setSession(createSession({ minutes, intention: trimmed }));
    setPhase('running');
  };

  const onVisit = () => setSession((s) => (s ? visit(s) : s));

  const onAbandon = () => {
    setSession((s) => {
      if (!s) return s;
      const next = abandon(s);
      setPhase('over');
      return next;
    });
  };

  const again = () => {
    setSession(null);
    setPhase('setup');
    inputRef.current?.focus();
  };

  return (
    <main className="room">
      <div className="fog" />

      <header className="masthead">
        <strong>Vigil</strong>
        <span>{phase === 'setup' ? 'light a candle' : 'the dark is listening'}</span>
      </header>

      <section className="stage">
        {phase === 'setup' && (
          <div className="panel">
            <p className="intention">
              Every time you drift, a ghost steps closer. Keep the flame until dawn.
            </p>

            <div className="choose" role="group" aria-label="Session length">
              {SESSION_LENGTHS.map((m) => (
                <button
                  key={m}
                  className="chip"
                  aria-pressed={m === minutes}
                  onClick={() => setMinutes(m)}
                >
                  <span>{m} minutes</span>
                  <span>{m <= 25 ? 'short' : m <= 50 ? 'long' : 'siege'}</span>
                </button>
              ))}
            </div>

            <div className="field">
              <label htmlFor="intention">What are you keeping watch over?</label>
              <input
                id="intention"
                ref={inputRef}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && start()}
                placeholder="finish the chapter before the sun comes up"
                maxLength={90}
                autoComplete="off"
              />
            </div>

            <div className="actions">
              <button className="btn btn-primary" onClick={start}>
                Light the candle
              </button>
            </div>
          </div>
        )}

        {phase === 'running' && session && (
          <div className="panel">
            <p className="intention">{session.config.intention || 'the night shift'}</p>

            <div
              className={session.status === 'paused' ? 'clock is-paused' : 'clock'}
              role="timer"
              aria-live="off"
            >
              {formatClock(remainingSeconds(session))}
            </div>

            <div className="track">
              <div className="track-fill" style={{ width: `${progress(session) * 100}%` }} />
            </div>

            <div className="haunt" aria-label={`${haunt} of ${MAX_HAUNT} ghosts near`}>
              {Array.from({ length: MAX_HAUNT }, (_, i) => (
                <Ghost key={i} near={i < haunt} last={i === MAX_HAUNT - 1} />
              ))}
            </div>

            <div className="readout" aria-live="polite">
              <div>
                Visits
                <b key={pulse}>{session.distractions.length}</b>
              </div>
              <div>
                Dread
                <b>{level}%</b>
              </div>
            </div>

            <div className="actions">
              <button className="btn btn-primary" onClick={onVisit}>
                Something caught my eye
              </button>
              <button
                className="btn"
                onClick={() =>
                  setSession((s) => (s?.status === 'paused' ? resume(s) : s ? pause(s) : s))
                }
              >
                {session.status === 'paused' ? 'Resume' : 'Hold'}
              </button>
              <button className="btn btn-quiet" onClick={onAbandon}>
                Blow it out
              </button>
            </div>
          </div>
        )}

        {phase === 'over' && session && <Ending session={session} onAgain={again} />}
      </section>

      <footer className="footer">
        {phase === 'running'
          ? `${session ? session.config.minutes : minutes} minute watch · ${MAX_HAUNT} ghosts`
          : 'a focus timer for the small hours'}
      </footer>
    </main>
  );
}

function Ending({ session, onAgain }: { session: SessionState; onAgain: () => void }) {
  const v = verdict(session);
  const span = Math.max(1, session.totalSeconds);
  const marks = useMemo(() => {
    // 把整段时长切成 48 格，落点了的格子标红。
    return Array.from({ length: 48 }, (_, i) => {
      const at = (i / 48) * span;
      return session.distractions.some((d) => d >= at && d < at + span / 48);
    });
  }, [session.distractions, span]);

  return (
    <div className="panel">
      <p className="intention">{session.config.intention || 'the night shift'}</p>
      <h1 className="verdict-title">{v.title}</h1>
      <p className="verdict-line">{v.line}</p>

      <div className="marks" aria-label="Where the ghosts found you">
        {marks.map((hit, i) => (
          <div key={i} className={hit ? 'mark is-hit' : 'mark'} style={{ height: `${20 + (i % 5) * 9}%` }} />
        ))}
      </div>

      <div className="readout">
        <div>
          Watched
          <b>{formatClock(session.elapsedSeconds)}</b>
        </div>
        <div>
          Visits
          <b>{session.distractions.length}</b>
        </div>
        <div>
          Longest hold
          <b>{formatClock(longestStretch(session))}</b>
        </div>
        <div>
          Dread
          <b>{dread(session)}%</b>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={onAgain}>
          Light another
        </button>
      </div>
    </div>
  );
}
