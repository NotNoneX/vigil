/**
 * Vigil 的核心模型：专注会话与"幽灵逼近"机制。
 *
 * 设计意图：普通的番茄钟只计时，Vigil 把"分心"变成看得见的威胁——
 * 每按一次"幽灵来访"，房间就暗一档、怨灵就靠近一步。
 * 全部逻辑保持纯函数，便于单测与后续替换计时源。
 */

export type SessionLength = 25 | 50 | 90;

export const SESSION_LENGTHS: readonly SessionLength[] = [25, 50, 90];

/** 幽灵的五个逼近阶段，0 最远、4 已到烛前。 */
export const MAX_HAUNT = 4;

export interface SessionConfig {
  /** 计划时长，分钟 */
  readonly minutes: SessionLength;
  /** 用户自定义的守夜对象，一句话 */
  readonly intention: string;
}

export interface SessionState {
  readonly config: SessionConfig;
  /** 已过秒数 */
  readonly elapsedSeconds: number;
  /** 总计秒数 */
  readonly totalSeconds: number;
  /** 幽灵逼近阶段，0..MAX_HAUNT */
  readonly haunt: number;
  /** 每次分心的时间戳（秒），用于回顾曲线 */
  readonly distractions: readonly number[];
  readonly status: 'running' | 'paused' | 'done' | 'abandoned';
}

export function createSession(config: SessionConfig): SessionState {
  const totalSeconds = config.minutes * 60;
  return {
    config,
    elapsedSeconds: 0,
    totalSeconds,
    haunt: 0,
    distractions: [],
    status: 'running',
  };
}

/** 剩余秒数，永不为负。 */
export function remainingSeconds(s: SessionState): number {
  return Math.max(0, s.totalSeconds - s.elapsedSeconds);
}

/** 完成百分比 0..1。 */
export function progress(s: SessionState): number {
  if (s.totalSeconds === 0) return 1;
  return Math.min(1, s.elapsedSeconds / s.totalSeconds);
}

/**
 * 某一档的"分心间隔容忍度"（秒）：间隔不超过该值，幽灵前进一步。
 * 档位越高要求越紧，末档收紧到 45 秒，避免最后一步白送。
 */
export function hauntThreshold(s: SessionState, step: number): number {
  const span = s.totalSeconds / 10;
  return Math.max(45, Math.floor(span / (step + 1)));
}

/**
 * 记录一次分心。时间戳取当前已过秒数。
 * 到顶后不再上升，但依然记录，便于回顾。
 */
export function visit(s: SessionState): SessionState {
  if (s.status !== 'running') return s;
  const at = s.elapsedSeconds;
  const gap = s.distractions.length === 0 ? at : at - (s.distractions.at(-1) ?? 0);
  const nearing = gap <= hauntThreshold(s, s.haunt);
  const nextHaunt = nearing ? Math.max(s.haunt, Math.min(MAX_HAUNT, s.haunt + 1)) : s.haunt;
  return { ...s, haunt: nextHaunt, distractions: [...s.distractions, at] };
}

/** 推进一个 tick；越过总时长即完成。 */
export function tick(s: SessionState, seconds = 1): SessionState {
  if (s.status !== 'running') return s;
  const elapsedSeconds = Math.min(s.totalSeconds, s.elapsedSeconds + Math.max(0, seconds));
  const done = elapsedSeconds >= s.totalSeconds;
  return { ...s, elapsedSeconds, status: done ? 'done' : 'running' };
}

export function pause(s: SessionState): SessionState {
  return s.status === 'running' ? { ...s, status: 'paused' } : s;
}

export function resume(s: SessionState): SessionState {
  return s.status === 'paused' ? { ...s, status: 'running' } : s;
}

export function abandon(s: SessionState): SessionState {
  return s.status === 'done' || s.status === 'abandoned' ? s : { ...s, status: 'abandoned' };
}

/** 幽灵的怨气值：分心越多越高，0..100。 */
export function dread(s: SessionState): number {
  const byHaunt = (s.haunt / MAX_HAUNT) * 70;
  const byCount = Math.min(30, s.distractions.length * 6);
  return Math.round(Math.min(100, byHaunt + byCount));
}

/** mm:ss */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** 结束语：按分心次数分档，语气逐级失控。 */
export function verdict(s: SessionState): { title: string; line: string } {
  if (s.status === 'abandoned') {
    return { title: 'You blew it out', line: 'The ghosts took the room. Tonight goes to them.' };
  }
  const n = s.distractions.length;
  if (n === 0) return { title: 'Unmoved', line: 'Not one ghost came near. The flame kept watch for you.' };
  if (n <= 2) return { title: 'Held the line', line: `${n} visits, every one of them turned away at the door.` };
  if (n <= 5) return { title: 'Swaying', line: `${n} visits. The flame shook for a long time, but it never went out.` };
  return { title: 'The room is full', line: `${n} visits. Next time, leave the phone in another room.` };
}
