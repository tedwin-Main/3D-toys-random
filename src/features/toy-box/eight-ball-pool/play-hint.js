/**
 * FILE: src/features/toy-box/eight-ball-pool/play-hint.js
 * PURPOSE: picks HUD hint line for current play phase, ball in hand, pointer type, camera
 * UI: Play > HUD hint
 * USED BY: play-page.js
 * KEY EXPORTS: hintFor
 */

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
