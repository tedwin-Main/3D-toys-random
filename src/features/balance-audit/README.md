# Balance audit

Checks every multiplayer toy against the rules of the genre or game it is based on, and checks that no seat or join slot wins more often.

| Script | What it checks | Run |
| --- | --- | --- |
| `live-match-audit.js` | Real lobby matches (host + bots over the local relay, headless). Checks each game's rule from `genre-rules.js` on every 100 ms sample, plus a seat-fairness test. | `npm run audit:live -- --games kart-race-online --rooms 4 --secs 1500` |
| `server-sim-audit.js` | Kart and Turbo Ball sims in node: join order vs finish place, item odds by place, blue vs orange goals and wins. | `npm run audit:sims` |
| `voxel-sync-audit.js` | Block Party on 3 tabs: racing edits, builder credit, late join, removals, the 12 000-block cap. | `npm run toys` then `npm run audit:voxel` |

`audit:live` starts the relay on `PORT` (default 5055) if nothing is listening there, and stops it when done.

Every multiplayer game is server-run (`serverRun` in `genre-rules.js`) since 2026-11-11: the relay owns the bots, so the skill-edge test reports `no skill knob` (page skill writes never reach the server), and the audit's own human sits idle. Turn games then wait out that human's turn clock every turn, so give them a long `--secs` (one 120 s pass ended 0-1 matches per turn game) to reach the 10 matches seat fairness needs.

## Pass marks

- **Rule check:** zero rule breaks, zero page errors, no NaN positions.
- **Seat fairness:** equal-skill bots (0.75). Chi-square on match wins per player id (join slot), leaving out the host. PASS when p ≥ 0.01 with at least 10 matches. `turnP` reports turn-position advantage too. In fence-fields, turn position decides many games between equal bots (measured), so its seats are drawn by lot each match.
- **Kart:** the first 4 and last 4 joiners finish within 0.5 places of each other. The top 4 get boosts at most 25% of the time; the bottom 4 at least 50%. Leaders get bananas most often.
- **Skill edge** (`--star 0.95 --rest 0.45`): one 0.95 bot plays 0.45 bots. It must win at least 2× its fair share, one-sided z ≥ 2.33. Bomb-tag, picnic-dash, light-cycle and paint have built-in luck (hot potato, secret simultaneous moves, crowded free-for-alls), so their bar is 1.5×.
- **Turbo Ball:** goal gap between teams ≤ 10%, team win bias |z| ≤ 2.58, kickoff boost 33 (Rocket League).

## Genre references

Each rule in `genre-rules.js` has a `ref`. Every source below was fetched and states the rule shown:

| Game | Rule | Source |
| --- | --- | --- |
| bank-or-bust | one 1 scores nothing for the turn, double 1 wipes the total | [Pig, two-dice](https://en.wikipedia.org/wiki/Pig_(dice_game)) |
| penguin-curling | trailing side throws last (hammer) | [NBC Olympics](https://nbcolympics.com/post/220646) |
| rocket-ball-soccer | kickoff boost 33 | [Dignitas](https://dignitas.gg/articles/boost-management-in-rocket-league) |
| kart-race-online | back of the pack gets stronger items | [Mario Wiki: Item Box](https://www.mariowiki.com/Item_Box) |
| gem-diggers | finding a gem gives another dig | [Minesweeper Flags](https://www.novelgames.com/minesflagger) |
| musical-chairs-party | one chair fewer than players | [Musical chairs](https://en.wikipedia.org/wiki/Musical_chairs) |
| treasure-auction | tied bids cancel | [Sealed bid with cancellation](https://gamesushi.github.io/quartz/Auctions/Sealed-Bid-with-Cancellation) |
| fence-fields | closing a box scores a point and gives another move | [Dots and boxes](https://en.wikipedia.org/wiki/Dots_and_boxes) |
| lucky-low | lowest unique pick wins | [Unique bid auction](https://en.wikipedia.org/wiki/Unique_bid_auction) |
| tank-battle-maze | self-kill costs one frag (Doom Deathmatch 2.0) | [Deathmatch](https://en.wikipedia.org/wiki/Deathmatch_(video_games)) |
| light-cycle-arena | hitting any wall is out; last rider wins | [Armagetron](https://ossblog.org/armagetron-advanced-tron-clone-3d) |
| balloon-battle | last player with a balloon wins | [Fatherly](https://www.fatherly.com/entertainment/stomp-the-balloon-game) |
| bomb-tag-arena | holder at the bang is out | [Hot potato](https://en.wikipedia.org/wiki/Hot_potato_(game)) |
| hex-drop-survival | last player left wins | [Fall Guys](https://en.wikipedia.org/wiki/Fall_Guys) |
| siege-hills | sides take turns | [Worms](https://en.wikipedia.org/wiki/Worms_(series)) |
| bumper-sumo-arena | forced out of the ring loses | [Sumo](https://en.wikipedia.org/wiki/Sumo) |
| king-of-the-hill | whoever holds the top wins | [King of the Hill](https://en.wikipedia.org/wiki/King_of_the_Hill_(game)) |
| mini-golf-party | not holed after 6 strokes scores 7 | [Rosfjord course rules](https://rosfjord.no/en/minigolf-park/course-rules/) |
| paint-territory | most floor inked wins | [Splatoon](https://en.wikipedia.org/wiki/Splatoon) |
| picnic-dash | moves chosen secretly, revealed together | [Simultaneous action selection](https://en.wikipedia.org/wiki/Simultaneous_action_selection) |
| sheepdog-rush | dog moves sheep into a pen | [Sheepdog trial](https://en.wikipedia.org/wiki/Sheepdog_trial) |
