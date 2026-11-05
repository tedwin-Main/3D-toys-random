// Lists games whose host runs on the relay server (party royale rounds and the full show), keyed by room game name.

import { ROUNDS } from '../toy-box/common/party-royale/show-director.js';
import { createPartyServerHost } from '../toy-box/common/party-royale/party-server-host.js';

const SHOW_GAME = 'bean-royale-show'; // party-game.js lobby name for the full show; single-round pages use the round id

export const hostedGames = {
  [SHOW_GAME]: (room) => createPartyServerHost(room, { show: true }),
  ...Object.fromEntries(Object.keys(ROUNDS).map((roundId) => [roundId, (room) => createPartyServerHost(room, { roundId })])),
};
