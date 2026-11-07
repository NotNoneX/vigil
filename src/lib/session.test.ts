import { describe, expect, it } from 'vitest';
import {
  MAX_HAUNT,
  SESSION_LENGTHS,
  abandon,
  createSession,
  dread,
  formatClock,
  hauntThreshold,
  pause,
  progress,
  remainingSeconds,
  resume,
  tick,
  verdict,
  visit,
} from './session';

const base = () => createSession({ minutes: 25, intention: 'finish the draft' });

describe('createSession', () => {
  it('从干净状态起步', () => {
    const s = base();
    expect(s.status).toBe('running');
    expect(s.haunt).toBe(0);
    expect(s.distractions).toEqual([]);
    expect(s.totalSeconds).toBe(1500);
  });

  it('接受全部官方时长', () => {
    for (const minutes of SESSION_LENGTHS) {
      expect(createSession({ minutes, intention: 'x' }).totalSeconds).toBe(minutes * 60);
    }
  });
});

describe('计时', () => {
  it('倒计时不为负', () => {
    let s = base();
    for (let i = 0; i < 2000; i++) s = tick(s, 1);
    expect(remainingSeconds(s)).toBe(0);
    expect(s.status).toBe('done');
  });

  it('完成后不再推进', () => {
    let s = base();
    for (let i = 0; i < 1600; i++) s = tick(s, 1);
    const frozen = s.elapsedSeconds;
    s = tick(s, 100);
    expect(s.elapsedSeconds).toBe(frozen);
  });

  it('进度封顶 1', () => {
    let s = base();
    for (let i = 0; i < 2000; i++) s = tick(s, 1);
    expect(progress(s)).toBe(1);
  });
});

describe('幽灵逼近', () => {
  it('短间隔分心会把幽灵推近', () => {
    let s = base();
    s = visit(s);
    expect(s.haunt).toBe(1);
  });

  it('长间隔分心不推近', () => {
    let s = base();
    s = tick(s, 900);
    s = visit(s);
    expect(s.haunt).toBe(0);
  });

  it('封顶在 MAX_HAUNT', () => {
    let s = base();
    for (let i = 0; i < 20; i++) s = visit(s);
    expect(s.haunt).toBe(MAX_HAUNT);
  });

  it('分心次数照常记录，即使已封顶', () => {
    let s = base();
    for (let i = 0; i < 8; i++) s = visit(s);
    expect(s.distractions).toHaveLength(8);
  });

  it('暂停时不记录', () => {
    const s = pause(visit(base()));
    expect(visit(s).distractions).toHaveLength(1);
  });

  it('阈值随时长放大且至少 45 秒', () => {
    const long = createSession({ minutes: 90, intention: 'x' });
    expect(hauntThreshold(long, 0)).toBeGreaterThan(hauntThreshold(base(), 0));
    expect(hauntThreshold(base(), MAX_HAUNT)).toBeGreaterThanOrEqual(45);
  });
});

describe('怨气值', () => {
  it('干净时为零', () => {
    expect(dread(base())).toBe(0);
  });

  it('封顶 100', () => {
    let s = base();
    for (let i = 0; i < 30; i++) s = visit(s);
    expect(dread(s)).toBeLessThanOrEqual(100);
  });

  it('分心越多越高', () => {
    const a = visit(base());
    const b = visit(visit(base()));
    expect(dread(b)).toBeGreaterThanOrEqual(dread(a));
  });
});

describe('状态机', () => {
  it('暂停后恢复', () => {
    const p = pause(base());
    expect(p.status).toBe('paused');
    expect(resume(p).status).toBe('running');
  });

  it('放弃后不再恢复', () => {
    const a = abandon(base());
    expect(a.status).toBe('abandoned');
    expect(resume(a).status).toBe('abandoned');
  });

  it('已完成不会被放弃覆盖', () => {
    let s = base();
    for (let i = 0; i < 1600; i++) s = tick(s, 1);
    expect(abandon(s).status).toBe('done');
  });
});

describe('展示', () => {
  it('时钟补零', () => {
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(-3)).toBe('00:00');
  });

  it('结束语分档', () => {
    let s = base();
    for (let i = 0; i < 1600; i++) s = tick(s, 1);
    expect(verdict(s).title).toBe('Unmoved');
    expect(verdict(abandon(base())).title).toBe('You blew it out');
  });
});
