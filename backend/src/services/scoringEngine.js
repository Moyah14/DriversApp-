/**
 * Rule-based driver safety scoring engine (thesis FR-05 / Sprint 3).
 *
 * Thresholds (aligned with methodology; scope uses 80/100 km/h variants —
 * implementation uses documented sprint criteria: speeding > 100 km/h,
 * harsh braking deceleration >= 12 km/h/s, idling speed=0 for > 300s).
 */

const SPEEDING_LIMIT_KMH = 100;
const HARSH_BRAKING_DECEL = 12; // km/h per second
const IDLING_SECONDS = 300;
const SPEEDING_PENALTY = 10;
const HARSH_BRAKING_PENALTY = 15;
const IDLING_PENALTY = 5;

/**
 * Evaluate a telemetry sample against previous sample for the same vehicle.
 * @param {object} current - { speed_kmh, recorded_at }
 * @param {object|null} previous - prior sample or null
 * @param {object} idleState - { idleSince: Date|null }
 */
function evaluateTelemetryEvent(current, previous, idleState = { idleSince: null }) {
  const speed = Number(current.speed_kmh) || 0;
  let eventType = 'normal';
  let penalty = 0;
  const nextIdle = { ...idleState };

  if (speed > SPEEDING_LIMIT_KMH) {
    eventType = 'speeding';
    penalty = SPEEDING_PENALTY;
  }

  if (previous) {
    const prevSpeed = Number(previous.speed_kmh) || 0;
    const dtMs =
      new Date(current.recorded_at).getTime() - new Date(previous.recorded_at).getTime();
    const dtSec = Math.max(dtMs / 1000, 0.001);
    const decel = (prevSpeed - speed) / dtSec;
    if (decel >= HARSH_BRAKING_DECEL) {
      eventType = 'harsh_braking';
      penalty = Math.max(penalty, HARSH_BRAKING_PENALTY);
    }
  }

  if (speed === 0) {
    if (!nextIdle.idleSince) nextIdle.idleSince = new Date(current.recorded_at);
    const idleSec =
      (new Date(current.recorded_at).getTime() - new Date(nextIdle.idleSince).getTime()) /
      1000;
    if (idleSec >= IDLING_SECONDS && eventType === 'normal') {
      eventType = 'excessive_idling';
      penalty = IDLING_PENALTY;
      nextIdle.idleSince = new Date(current.recorded_at); // reset window
    }
  } else {
    nextIdle.idleSince = null;
  }

  return { eventType, penalty, idleState: nextIdle };
}

/**
 * Composite score: start at 100, deduct penalties, clamp 0–100.
 * Optional distance normalization: penalties adjusted per 100 km.
 */
function computeScoreFromPenalties(totalPenalties, distanceKm = 0) {
  const distanceFactor = distanceKm > 0 ? Math.max(distanceKm / 100, 0.1) : 1;
  const adjusted = totalPenalties / distanceFactor;
  const score = Math.max(0, Math.min(100, 100 - adjusted));
  return Math.round(score * 100) / 100;
}

module.exports = {
  SPEEDING_LIMIT_KMH,
  HARSH_BRAKING_DECEL,
  IDLING_SECONDS,
  SPEEDING_PENALTY,
  HARSH_BRAKING_PENALTY,
  IDLING_PENALTY,
  evaluateTelemetryEvent,
  computeScoreFromPenalties,
};
