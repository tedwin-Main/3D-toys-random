// Lists games whose host runs on the relay server (party royale rounds, the full show, kart + turbo ball), keyed by room game name.

import { ROUNDS } from '../toy-box/common/party-royale/show-director.js';
import { createPartyServerHost } from '../toy-box/common/party-royale/party-server-host.js';
import { createSimServerHost } from '../toy-box/common/server-run/sim-server-host.js';
import { createKartSim } from '../toy-box/kart-race-online/kart-sim.js';
import { createTurboSim } from '../toy-box/rocket-ball-soccer/turbo-sim.js';

const SHOW_GAME = 'bean-royale-show'; // party-game.js lobby name for the full show; single-round pages use the round id

export const hostedGames = {
  [SHOW_GAME]: (room) => createPartyServerHost(room, { show: true }),
  'kart-party': (room) => createSimServerHost(room, { createSim: createKartSim }),
  'turbo-ball': (room) => createSimServerHost(room, { createSim: createTurboSim }),
  ...Object.fromEntries(Object.keys(ROUNDS).map((roundId) => [roundId, (room) => createPartyServerHost(room, { roundId })])),
};
