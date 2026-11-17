// Computes HUD hint text based on turn phase, ball in hand, and input mode.

// Play > HUD hint: empty string when nothing to say
export function hintFor( { phase, ballInHand, finePointer, cameraMode } ) {
  if ( phase === 'bot' ) return 'Bot is lining up…'
  if ( phase === 'shooting' || phase === 'replay' ) return 'Tap table to skip'
  if ( phase !== 'aim' ) return ''
  if ( ballInHand ) return 'Ball in hand: drag the cue ball, then shoot'
  return finePointer && cameraMode === 'overhead'
    ? 'Move to aim · press, pull back, release · ← → fine aim'
    : 'Tap or drag to aim · pull power bar down, release'
}
