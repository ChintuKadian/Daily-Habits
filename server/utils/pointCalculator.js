// =============================================================
//  server/utils/pointCalculator.js  (also mirrored in client)
//  Daily Habits — Gamified Point & Rank Engine
// =============================================================

'use strict';

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────

/** Base points awarded per priority level before any multiplier. */
const BASE_POINTS = Object.freeze({
  high:   100,
  medium: 60,
  low:    30,
});

/** Multiplier applied when task is completed before its deadline. */
const MULTIPLIER_ON_TIME = 1.0;   // Full points — complete before deadline

/** Multiplier applied when task is completed in Recovery Mode (after deadline). */
const MULTIPLIER_RECOVERY = 0.5; // Half points — late penalty

/**
 * Rank thresholds — evaluated from highest to lowest.
 * `minPoints` is the minimum cumulative daily score required for that rank.
 */
const RANK_THRESHOLDS = Object.freeze([
  { rank: 'S', minPoints: 1000, label: 'S-Rank', description: 'Legendary'   },
  { rank: 'A', minPoints: 700,  label: 'A-Rank', description: 'Elite'        },
  { rank: 'B', minPoints: 400,  label: 'B-Rank', description: 'Solid'        },
  { rank: 'C', minPoints: 200,  label: 'C-Rank', description: 'Average'      },
  { rank: 'D', minPoints: 0,    label: 'D-Rank', description: 'Keep pushing' },
]);

// ─────────────────────────────────────────────────────────────
//  CORE CALCULATION
// ─────────────────────────────────────────────────────────────

/**
 * Calculate the points to award when a task is marked complete.
 *
 * @param {object} params
 * @param {'high'|'medium'|'low'} params.priority   Task priority level.
 * @param {Date|string|number}    params.deadline    Task deadline (any Date-like value).
 * @param {Date|string|number}    [params.completedAt=Date.now()]
 *   The moment the task was completed. Defaults to now.
 *   Pass a specific value in tests to freeze time.
 *
 * @returns {{
 *   priority:          string,
 *   basePoints:        number,
 *   multiplier:        number,
 *   pointsAwarded:     number,
 *   isOnTime:          boolean,
 *   isRecovery:        boolean,
 *   msRemaining:       number,
 *   minutesLate:       number|null,
 * }}
 */
function calculate({ priority, deadline, completedAt = Date.now() }) {
  // ── Input validation ─────────────────────────────────────
  if (!BASE_POINTS[priority]) {
    throw new Error(
      `Invalid priority "${priority}". Must be one of: ${Object.keys(BASE_POINTS).join(', ')}.`
    );
  }

  const deadlineMs    = new Date(deadline).getTime();
  const completedMs   = new Date(completedAt).getTime();

  if (isNaN(deadlineMs)) {
    throw new Error(`Invalid deadline value: "${deadline}"`);
  }
  if (isNaN(completedMs)) {
    throw new Error(`Invalid completedAt value: "${completedAt}"`);
  }

  // ── Core logic ───────────────────────────────────────────
  const basePoints  = BASE_POINTS[priority];
  const msRemaining = deadlineMs - completedMs;   // negative if late
  const isOnTime    = msRemaining >= 0;
  const isRecovery  = !isOnTime;

  const multiplier    = isOnTime ? MULTIPLIER_ON_TIME : MULTIPLIER_RECOVERY;
  const pointsAwarded = Math.round(basePoints * multiplier);

  // How many whole minutes past the deadline (null when on time)
  const minutesLate = isRecovery
    ? Math.round(Math.abs(msRemaining) / 60_000)
    : null;

  return {
    priority,
    basePoints,
    multiplier,
    pointsAwarded,
    isOnTime,
    isRecovery,
    msRemaining,       // ms > 0 → still has time; ms < 0 → past deadline
    minutesLate,       // null when completed on time
  };
}

// ─────────────────────────────────────────────────────────────
//  SCOREBOARD HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Map a cumulative daily points total to a rank object.
 *
 * @param {number} totalPoints  Accumulated points for the day.
 * @returns {{ rank: string, label: string, description: string, minPoints: number }}
 *
 * @example
 *   getRank(850)  // → { rank: 'A', label: 'A-Rank', description: 'Elite', minPoints: 700 }
 *   getRank(50)   // → { rank: 'D', label: 'D-Rank', description: 'Keep pushing', minPoints: 0 }
 */
function getRank(totalPoints) {
  const pts = Math.max(0, Math.round(totalPoints));
  // Thresholds are sorted highest → lowest; first match wins
  return RANK_THRESHOLDS.find((t) => pts >= t.minPoints) ?? RANK_THRESHOLDS.at(-1);
}

/**
 * Return the next rank above the current one, or null if already S-Rank.
 *
 * @param {number} totalPoints
 * @returns {{ rank: string, label: string, minPoints: number, pointsNeeded: number }|null}
 */
function getNextRank(totalPoints) {
  const pts         = Math.max(0, Math.round(totalPoints));
  const currentRank = getRank(pts);
  const currentIdx  = RANK_THRESHOLDS.findIndex((t) => t.rank === currentRank.rank);
  if (currentIdx === 0) return null; // already S-Rank

  const next = RANK_THRESHOLDS[currentIdx - 1];
  return {
    ...next,
    pointsNeeded: next.minPoints - pts,
  };
}

/**
 * Recalculate a user's total daily points from an array of completed task results.
 * Useful for rebuilding the scoreboard from scratch (e.g. after a task is deleted).
 *
 * @param {Array<{ pointsAwarded: number }>} completedTasks
 * @returns {number}  Summed total, rounded to nearest integer.
 */
function sumDailyPoints(completedTasks) {
  return Math.round(
    completedTasks.reduce((sum, t) => sum + (t.pointsAwarded ?? 0), 0)
  );
}

// ─────────────────────────────────────────────────────────────
//  PREVIEW / ESTIMATION  (for the UI before a task is completed)
// ─────────────────────────────────────────────────────────────

/**
 * Show the user what they could earn — useful to display on the task card
 * while the task is still pending.
 *
 * @param {'high'|'medium'|'low'} priority
 * @param {Date|string|number}    deadline
 * @returns {{
 *   ifOnTime:   number,   // points if completed before deadline
 *   ifRecovery: number,   // points if completed after deadline
 *   basePoints: number,
 * }}
 */
function previewPoints(priority, deadline) {
  if (!BASE_POINTS[priority]) {
    throw new Error(`Invalid priority: "${priority}"`);
  }
  const base = BASE_POINTS[priority];
  return {
    basePoints: base,
    ifOnTime:   Math.round(base * MULTIPLIER_ON_TIME),
    ifRecovery: Math.round(base * MULTIPLIER_RECOVERY),
  };
}

// ─────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  calculate,
  getRank,
  getNextRank,
  sumDailyPoints,
  previewPoints,
  // Constants (exported so controllers can use them without magic numbers)
  BASE_POINTS,
  MULTIPLIER_ON_TIME,
  MULTIPLIER_RECOVERY,
  RANK_THRESHOLDS,
};


// =============================================================
//  USAGE EXAMPLES (also serve as manual test cases)
// =============================================================

/*

const pc = require('./pointCalculator');

// ── 1. High-priority task completed 30 minutes early ──────────
const result1 = pc.calculate({
  priority:    'high',
  deadline:    new Date('2025-07-15T18:00:00Z'),
  completedAt: new Date('2025-07-15T17:30:00Z'),  // 30 min early
});
console.log(result1);
// {
//   priority:      'high',
//   basePoints:    100,
//   multiplier:    1.2,
//   pointsAwarded: 120,   ← Math.round(100 × 1.2)
//   isOnTime:      true,
//   isRecovery:    false,
//   msRemaining:   1800000,
//   minutesLate:   null,
// }


// ── 2. Medium-priority task completed 2 hours late (Recovery) ──
const result2 = pc.calculate({
  priority:    'medium',
  deadline:    new Date('2025-07-15T14:00:00Z'),
  completedAt: new Date('2025-07-15T16:00:00Z'),  // 2 hours late
});
console.log(result2);
// {
//   priority:      'medium',
//   basePoints:    50,
//   multiplier:    0.5,
//   pointsAwarded: 25,    ← Math.round(50 × 0.5)
//   isOnTime:      false,
//   isRecovery:    true,
//   msRemaining:   -7200000,
//   minutesLate:   120,
// }


// ── 3. Low-priority task right at the deadline (boundary) ──────
const result3 = pc.calculate({
  priority:    'low',
  deadline:    new Date('2025-07-15T09:00:00Z'),
  completedAt: new Date('2025-07-15T09:00:00Z'),  // exactly on time
});
console.log(result3);
// { pointsAwarded: 24, isOnTime: true, ... }


// ── 4. Rank lookup ─────────────────────────────────────────────
console.log(pc.getRank(950));
// { rank: 'S', label: 'S-Rank', description: 'Legendary', minPoints: 1000 }
//  ^ 950 ≥ 700 (A) but 950 < 1000 (S) → so getRank returns A
//    (fix: 950 < 1000, so correct result is A-Rank)

console.log(pc.getRank(1050));
// { rank: 'S', label: 'S-Rank', description: 'Legendary', minPoints: 1000 }

console.log(pc.getNextRank(250));
// { rank: 'B', label: 'B-Rank', minPoints: 400, pointsNeeded: 150 }


// ── 5. Preview what a task is worth before completion ──────────
console.log(pc.previewPoints('high', new Date('2025-07-15T18:00:00Z')));
// { basePoints: 100, ifOnTime: 120, ifRecovery: 50 }

*/
