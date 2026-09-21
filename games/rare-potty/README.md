# Rare Potty

**Every Friend has to go.** Rare Potty is a comedy gacha minigame for the Rare Friends Vibeathon. The player's freshly verified Generations NFT is the main character: enter the stall, choose a questionable action, spend simulated $RAREFRIENDS and discover a collectible for the Friend's Potty Bag.

## Run

Requires Node.js 22+, a browser wallet on Robinhood mainnet (chain 4663), and a hardwired Rare Friends Generations NFT (generation 1+).

```sh
npm ci
npm run build
npx friendsdk dev games/rare-potty
```

Open the displayed local URL, connect the wallet, select an eligible Friend and enter the game. The official FriendSDK v0.1.2 runtime handles wallet connection, NFT discovery, fresh ownership verification, Friend selection, sandboxing and confirmations.

## How to play

1. Press **Enter the Potty**.
2. Choose Courtesy Flush, Open the Hole or Mystery Paper.
3. Confirm the simulated 2 RF Potty Pass purchase.
4. Reveal one weighted outcome and add it to the selected Friend's session-only Potty Bag.
5. Go again and fill the session's Global Septic Tank meter.

Keyboard and touch controls are supported. The original **Rare Friends** theme begins after the first player tap, loops during play and shares the in-game sound toggle. Settings also include reduced motion.

## Exact preview economy

| Outcome | Chance | Simulated fixed reward |
| --- | ---: | ---: |
| Suspicious Smell | 36% | 0 RF |
| Plunger Hat | 24% | 0 RF |
| Toilet Paper Mummy | 17% | 0 RF |
| Tiny Toilet Companion | 11% | 0 RF |
| Golden Turd | 7% | 1 RF |
| Mutant Friend | 4% | 2 RF |
| Portal to the Sewerverse | 1% | 5 RF |

One Potty Pass costs 2 RF and produces one outcome. All balances, purchases, outcomes, rewards and collectibles are simulated. Reloading resets the session. No contracts are deployed and no transactions or real-money actions occur. The Global Septic Tank is a session meter in this MVP; persistent community progress, graffiti, toilet upgrades and live RF burns are proposed future integrations requiring Rare Friends review and additional platform support.

## Assets and known limitations

- Friend identity and canonical onchain sprite artwork are loaded through FriendSDK.
- The original Rare Potty background was AI-generated for this project.
- The Rare Friends theme song was supplied by the builder and converted to MP3 for browser compatibility.
- Session state is not persistent because the sandbox does not expose a save API.
- The three toilet choices share the published weighted outcome table in v0.1.2; they are narrative choices rather than separate onchain probability tables.
- A public preview still requires an eligible wallet and NFT, as required by FriendSDK.
