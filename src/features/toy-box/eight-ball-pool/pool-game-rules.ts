// Enforces standard 8-ball rules: fouls, ball assignment, turns, and win states.

export const SOLIDS = Object.freeze( [ 1, 2, 3, 4, 5, 6, 7 ] )
export const STRIPES = Object.freeze( [ 9, 10, 11, 12, 13, 14, 15 ] )
const GROUP_BALLS = { solids: SOLIDS, stripes: STRIPES }
const OTHER_GROUP = { solids: 'stripes', stripes: 'solids' }

export const groupOf = ( id ) => ( id === 8 ? 'eight' : id < 8 ? 'solids' : 'stripes' )

// Play > menu > mode: fresh game; break shot placed behind head string
export function createGame( { mode = 'practice', difficulty = 'easy' } = {} ) {
  const players = mode === 'bot'
    ? [ { name: 'You', kind: 'human', group: null }, { name: 'Bot', kind: 'bot', group: null } ]
    : [ { name: 'You', kind: 'human', group: null } ]
  return {
    mode,
    difficulty,
    players,
    turn: 0,
    phase: 'break',
    ballInHand: 'kitchen',
    potted: [],
    shots: 0,
    winner: null,
    message: mode === 'bot' ? 'Your break' : 'Break the rack',
  }
}

export const onTableIds = ( state ) => {
  const gone = new Set( state.potted )
  const ids = []
  for ( let id = 1; id <= 15; id += 1 ) if ( !gone.has( id ) ) ids.push( id )
  return ids
}

// Play > aim overlay: balls cue may hit first this shot
export function legalTargets( state, turn = state.turn ) {
  const onTable = onTableIds( state )
  if ( state.mode === 'practice' || state.phase === 'break' ) return onTable
  const group = state.players[ turn ].group
  if ( !group ) {
    const open = onTable.filter( ( id ) => id !== 8 )
    return open.length ? open : [ 8 ]
  }
  const own = onTable.filter( ( id ) => groupOf( id ) === group )
  return own.length ? own : [ 8 ]
}

const playerLabel = ( state, index ) => ( state.players[ index ].kind === 'bot' ? 'Bot' : 'You' )

// Play > shot end: practice is free play; only scratch costs anything
const applyPracticeShot = ( state, { pocketed } ) => {
  const scratch = pocketed.includes( 0 )
  const potted = [ ...state.potted, ...pocketed.filter( ( id ) => id !== 0 ) ]
  const shots = state.shots + 1
  const events = pocketed.filter( ( id ) => id !== 0 ).map( ( id ) => ( { type: 'pot', id } ) )
  const cleared = potted.length >= 15
  if ( scratch ) events.push( { type: 'foul', reason: 'scratch' } )
  if ( cleared ) events.push( { type: 'cleared', shots } )
  return {
    state: {
      ...state,
      phase: cleared ? 'over' : 'play',
      potted,
      shots,
      ballInHand: scratch && !cleared ? 'anywhere' : null,
      winner: cleared ? 0 : null,
      message: cleared ? `Cleared in ${ shots } shots` : scratch ? 'Scratch: ball in hand' : `${ potted.length } of 15 potted`,
    },
    events,
  }
}

// Play > shot end: fold one shot result into game state. result = { firstContact, pocketed }
export function applyShot( state, result ) {
  if ( state.phase === 'over' ) return { state, events: [] }
  if ( state.mode === 'practice' ) return applyPracticeShot( state, result )

  const { firstContact, pocketed } = result
  const turn = state.turn
  const opponent = 1 - turn
  const targets = legalTargets( state )
  const breaking = state.phase === 'break'
  const scratch = pocketed.includes( 0 )
  const objectPotted = pocketed.filter( ( id ) => id !== 0 )
  const eightPotted = objectPotted.includes( 8 )
  const events = objectPotted.map( ( id ) => ( { type: 'pot', id, player: turn } ) )

  let foulReason = null
  if ( scratch ) foulReason = 'scratch'
  else if ( firstContact === null || firstContact === undefined ) foulReason = 'no-contact'
  else if ( !breaking && !targets.includes( firstContact ) ) foulReason = 'wrong-ball'
  const foul = foulReason !== null
  if ( foul ) events.push( { type: 'foul', reason: foulReason, player: turn } )

  const players = state.players.map( ( player ) => ( { ...player } ) )
  const shots = state.shots + 1
  // 8 off break comes back: game never ends on break
  const respotEight = eightPotted && breaking
  if ( respotEight ) events.push( { type: 'respot', id: 8 } )
  const potted = [ ...state.potted, ...objectPotted.filter( ( id ) => !( respotEight && id === 8 ) ) ]

  if ( eightPotted && !breaking ) {
    const legalEight = targets.length === 1 && targets[ 0 ] === 8 && !foul
    const winner = legalEight ? turn : opponent
    events.push( { type: legalEight ? 'win' : 'lose', player: turn } )
    return {
      state: {
        ...state,
        players,
        potted,
        shots,
        phase: 'over',
        ballInHand: null,
        winner,
        message: `${ playerLabel( state, winner ) } ${ winner === 0 ? 'win' : 'wins' }`,
      },
      events,
    }
  }

  const groupBefore = players[ turn ].group
  const legalPots = objectPotted.filter( ( id ) => id !== 8 )
  if ( !breaking && !groupBefore && !foul && legalPots.length ) {
    // first legally potted ball after break sets groups
    const group = groupOf( legalPots[ 0 ] )
    players[ turn ].group = group
    players[ opponent ].group = OTHER_GROUP[ group ]
    events.push( { type: 'groups', player: turn, group } )
  }
  // open table (incl. break): any pot keeps turn; groups set: own ball needed
  const continues = !foul && ( groupBefore
    ? legalPots.some( ( id ) => GROUP_BALLS[ groupBefore ].includes( id ) )
    : legalPots.length > 0 )

  const nextTurn = continues ? turn : opponent
  if ( !continues ) events.push( { type: 'turn', player: nextTurn } )
  const nextLabel = playerLabel( state, nextTurn )
  const foulText = { scratch: 'Scratch', 'no-contact': 'No ball hit', 'wrong-ball': 'Wrong ball first' }
  const message = foul
    ? `Foul: ${ foulText[ foulReason ] }. ${ nextLabel === 'You' ? 'Your' : 'Bot' } ball in hand`
    : continues ? `${ nextLabel === 'You' ? 'You' : 'Bot' } continue${ nextLabel === 'You' ? '' : 's' }`
      : `${ nextLabel === 'You' ? 'Your' : 'Bot\'s' } turn`

  return {
    state: {
      ...state,
      players,
      potted,
      shots,
      turn: nextTurn,
      phase: 'play',
      ballInHand: foul ? 'anywhere' : null,
      winner: null,
      message,
    },
    events,
  }
}
