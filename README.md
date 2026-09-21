# Rare Potty

**Every Friend has to go.**

Rare Potty is a comedy gacha mini-game built for the 2026 Rare Friends Vibeathon with [FriendSDK](https://github.com/spokesz/friendsdk).

[Play Rare Potty](https://rare-potty.bbtntwrk.chatgpt.site)

## What it does

Connect a wallet, pick an eligible Friend, buy a simulated 2 RF Potty Pass, choose a stall, and discover what comes out. Outcomes range from a Suspicious Smell to a Portal to the Sewerverse, with simulated RF rewards on rare outcomes.

## Controls

- Tap or click **ENTER** to begin.
- Connect a wallet and choose a Friend.
- Buy a Potty Pass for **2 RF** (simulated).
- Choose a stall and tap **FLUSH AGAIN** to replay.
- Use **SOUND** and **MUSIC** to control audio.

## Source layout

The FriendSDK game package is in `games/rare-potty/`. It includes the game source, manifest, styles, background art, and theme music.

## Run locally

1. Clone and build [FriendSDK v0.1.2](https://github.com/spokesz/friendsdk).
2. Copy `games/rare-potty` from this repository into the FriendSDK repository's `games/` directory.
3. From the FriendSDK root, run:

```bash
npm ci
npm run build
npx friendsdk dev games/rare-potty
```

Then open the local URL printed by the FriendSDK CLI.

## Validation

```bash
npx friendsdk check games/rare-potty
```

The FriendSDK structural check passes.

## Credits

Built by Barry Toren ([@FlobioBroker](https://github.com/FlobioBroker)). Theme music supplied by the builder. Background artwork was created for this project. Friend characters are rendered through FriendSDK.
