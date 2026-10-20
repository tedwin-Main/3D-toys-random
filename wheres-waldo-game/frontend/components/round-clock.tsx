// Round timer as an analog clock face instead of a number.
//
// Two readings in one dial: the wedge is how much of the round is left (a full
// disc at the start, eaten away anticlockwise), and the hand is a second hand
// running backwards, one sweep per minute. The wedge answers "roughly how long
// have I got", the hand answers "is it actually still running".

const SIZE = 30;
const R = SIZE / 2;
const FACE_R = R - 2;

/** Point on the dial at `turns` (0 = twelve o'clock, 1 = all the way round). */
function dialPoint(turns: number, radius: number): [number, number] {
  const a = turns * Math.PI * 2 - Math.PI / 2;
  return [R + Math.cos(a) * radius, R + Math.sin(a) * radius];
}

export function RoundClock({ remaining, total }: { remaining: number; total: number }) {
  const left = Math.max(0, Math.min(1, remaining / total));
  const seconds = Math.max(0, remaining / 1000);
  const urgent = remaining < 15000;
  const colour = urgent ? 'var(--warn)' : 'var(--dim)';

  // remaining-time wedge, drawn as a pie slice from twelve o'clock
  const [ex, ey] = dialPoint(left, FACE_R - 2);
  const wedge = left >= 0.999
    ? `M ${R} ${R - (FACE_R - 2)} A ${FACE_R - 2} ${FACE_R - 2} 0 1 1 ${R - 0.01} ${R - (FACE_R - 2)} Z`
    : `M ${R} ${R} L ${R} ${R - (FACE_R - 2)} A ${FACE_R - 2} ${FACE_R - 2} 0 ${left > 0.5 ? 1 : 0} 1 ${ex} ${ey} Z`;

  // second hand, sweeping backwards so the whole dial reads as counting down
  const [hx, hy] = dialPoint((seconds % 60) / 60, FACE_R - 3.5);

  return (
    <span className={urgent ? 'clock urgent' : 'clock'} role="timer" aria-label={`${seconds.toFixed(0)} seconds left`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle cx={R} cy={R} r={FACE_R} fill="rgba(255,255,255,0.04)" stroke={colour} strokeWidth="1.2" />
        <path d={wedge} fill={urgent ? 'rgba(224, 96, 72, 0.35)' : 'rgba(220, 214, 196, 0.18)'} />
        {/* quarter ticks, so the wedge has something to be read against */}
        {[0, 0.25, 0.5, 0.75].map((t) => {
          const [x1, y1] = dialPoint(t, FACE_R - 1.5);
          const [x2, y2] = dialPoint(t, FACE_R - 3.5);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth="1" />;
        })}
        <line x1={R} y1={R} x2={hx} y2={hy} stroke={colour} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx={R} cy={R} r="1.4" fill={colour} />
      </svg>
    </span>
  );
}
