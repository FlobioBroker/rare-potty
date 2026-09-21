"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { createFriendReader, spriteFrame, type GenerationSprites } from "@rarefriends/friendsdk/sprites";
import { createFriendSoundKit, type FriendSoundKit } from "@rarefriends/friendsdk/sounds";
import type { GamePlay, GameSnapshot } from "@rarefriends/friendsdk/game";
import rareFriendsTheme from "./rare-friends-theme.mp3";
import "@rarefriends/friendsdk/frame.css";
import "./style.css";

type Screen = "yard" | "choices" | "reward" | "bag" | "settings";
const ACTIONS = [
  { id: "flush", label: "COURTESY FLUSH", note: "Polite. Suspiciously polite.", icon: "↻" },
  { id: "hole", label: "OPEN THE HOLE", note: "This is a terrible idea.", icon: "?" },
  { id: "paper", label: "MYSTERY PAPER", note: "Single-ply. Possibly cursed.", icon: "▧" },
] as const;
const ICONS = ["☁", "♙", "▧", "♛", "◆", "☣", "★"];

function FriendSprite({ sprites, inside }: { sprites: GenerationSprites; inside: boolean }) {
  const rows = spriteFrame(sprites, "up", inside, inside ? 3 : 0).frame.rows;
  return <div className={`friend-sprite ${inside ? "is-entering" : ""}`} aria-label={`Rare Friend #${sprites.tokenId.toString()}`}>
    {rows.flatMap((row, y) => [...row].map((pixel, x) => <i key={`${x}-${y}`} className={pixel === "#" ? "on" : "off"} />))}
  </div>;
}

const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;

export default function RarePotty({ friendId, client, paused }: GameComponentProps) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [sprites, setSprites] = useState<GenerationSprites | null>(null);
  const [screen, setScreen] = useState<Screen>("yard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GamePlay | null>(null);
  const [visits, setVisits] = useState(0);
  const [choice, setChoice] = useState("");
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sound = useRef<FriendSoundKit | null>(null);
  const music = useRef<HTMLAudioElement | null>(null);
  const epoch = useRef(0);
  const locked = useRef(false);
  const definition = client.definition;

  useEffect(() => {
    const version = ++epoch.current;
    sound.current = createFriendSoundKit({ muted: false });
    music.current = new Audio(rareFriendsTheme); music.current.loop = true; music.current.volume = .34; music.current.preload = "auto";
    setSnapshot(null); setSprites(null); setScreen("yard"); setBusy(false); setError(""); setResult(null); setVisits(0); setChoice("");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(preference.matches);
    syncMotion(); preference.addEventListener("change", syncMotion);
    void Promise.all([client.read(), createFriendReader().read(friendId)]).then(([next, art]) => {
      if (version !== epoch.current) return;
      if (next.friendId !== friendId) throw new Error("The selected Friend does not match this game session.");
      setSnapshot(next); setSprites(art);
    }).catch(cause => { if (version === epoch.current) setError(cause instanceof Error ? cause.message : "Rare Potty failed to open."); });
    return () => { epoch.current++; sound.current?.dispose(); music.current?.pause(); music.current = null; preference.removeEventListener("change", syncMotion); };
  }, [client, friendId]);

  const collected = useMemo(() => snapshot?.inventory.reduce((total, n) => total + n, 0n) ?? 0n, [snapshot]);
  const outcome = result?.outcomeId ? definition.outcomes[result.outcomeId - 1] : null;
  const septic = Math.min(100, visits * 17);

  async function enterPotty() {
    if (!snapshot || paused || locked.current) return;
    locked.current = true; setBusy(true); setError(""); setChoice("");
    try {
      void sound.current?.unlock(); sound.current?.play("action-start"); if (!muted) void music.current?.play().catch(() => undefined);
      await new Promise(resolve => window.setTimeout(resolve, reducedMotion ? 0 : 650));
      setScreen("choices");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The door jammed. Try again.");
    } finally {
      setBusy(false); locked.current = false;
    }
  }

  async function makeChoice(action: typeof ACTIONS[number]) {
    if (!snapshot || paused || locked.current) return;
    const version = epoch.current;
    locked.current = true; setBusy(true); setChoice(action.label); setError("");
    void sound.current?.unlock(); sound.current?.play("purchase");
    try {
      let next = snapshot;
      if (next.consumables === 0n) { await client.buy(1n); next = await client.read(); }
      const pending = next.plays.find(play => play.outcomeId === null);
      const play = pending ?? (await client.play(1n))[0];
      const settled = await client.settle(play.id);
      const refreshed = await client.read();
      if (version === epoch.current) {
        setSnapshot(refreshed); setResult(settled); setVisits(value => value + 1); setScreen("reward");
        sound.current?.play(settled.outcomeId >= definition.outcomes.length - 1 ? "reveal-rare" : "reveal-common");
      }
    } catch (cause) {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "The toilet refused to cooperate.");
    } finally {
      if (version === epoch.current) { setBusy(false); locked.current = false; }
    }
  }

  if (!snapshot || !sprites) return <div className="potty-loading" role={error ? "alert" : "status"}>
    <span>RARE POTTY</span><strong>{error || "UNLOCKING THE STALL…"}</strong>
    {error && <button type="button" onClick={() => window.location.reload()}>TRY AGAIN</button>}
  </div>;

  return <section className={`rare-potty ${reducedMotion ? "reduce-motion" : ""}`} aria-label="Rare Potty" aria-busy={busy}>
    <div className="scene" inert={screen !== "yard" || paused || undefined}>
      <header className="hud">
        <div className="brand"><strong>RARE POTTY</strong><small>EVERY FRIEND HAS TO GO.</small></div>
        <div className="hud-actions"><button type="button" onClick={() => setScreen("bag")}>POTTY BAG <b>{collected.toString()}</b></button><button type="button" aria-label="Settings" onClick={() => setScreen("settings")}>⚙</button></div>
      </header>
      <div className="septic" aria-label={`Global septic tank ${septic}% full`}><span>GLOBAL SEPTIC TANK</span><div><i style={{ width: `${septic}%` }} /></div><b>{septic}%</b></div>
      <div className="friend-label">FRIEND #{friendId.toString()}</div><FriendSprite sprites={sprites} inside={busy} />
      <button className="enter" type="button" disabled={busy || paused} onClick={() => void enterPotty()}>{busy ? "DOOR CLOSING…" : "ENTER THE POTTY"}</button>
      <p className="preview-note">SIMULATED ECONOMY · {rf(snapshot.rfBalance)} AVAILABLE</p>
    </div>

    {screen === "choices" && <GameMenu title="YOU'RE INSIDE. NOW WHAT?" onClose={busy ? undefined : () => setScreen("yard")}>
      <p className="menu-intro">Pick your move. Each visit costs {rf(definition.price)} in simulated $RAREFRIENDS.</p>
      <div className="choice-grid">{ACTIONS.map(action => <button key={action.id} type="button" disabled={busy || paused} onClick={() => void makeChoice(action)}><span>{action.icon}</span><strong>{action.label}</strong><small>{action.note}</small></button>)}</div>
      <p role={error ? "alert" : "status"} className="feedback">{error || (busy ? `${choice}… HOLD YOUR NOSE.` : "Rare things happen in terrible places.")}</p>
    </GameMenu>}

    {screen === "reward" && outcome && <GameMenu title="THE DOOR OPENS…" onClose={() => setScreen("yard")}>
      <div className={`reward-card rarity-${result?.outcomeId ?? 1}`}><span className="reward-icon">{ICONS[Number(result!.outcomeId) - 1] ?? "?"}</span><small>{choice}</small><h2>{outcome.name}</h2><p>{outcome.chanceBps / 100}% discovery · added to Friend #{friendId.toString()}'s Potty Bag</p></div>
      <div className="reward-actions"><button type="button" className="rf-frame-primary" onClick={() => setScreen("yard")}>GO AGAIN</button><button type="button" onClick={() => setScreen("bag")}>VIEW POTTY BAG</button></div><p className="feedback">What happens in the potty stays onchain. Eventually.</p>
    </GameMenu>}

    {screen === "bag" && <GameMenu title="POTTY BAG" onClose={() => setScreen("yard")}>
      <p className="menu-intro">Friend #{friendId.toString()} has survived {visits} visit{visits === 1 ? "" : "s"}.</p>
      <div className="bag-list">{definition.outcomes.map((item, index) => <div key={item.name} className={snapshot.inventory[index] > 0n ? "found" : "locked"}><span>{snapshot.inventory[index] > 0n ? ICONS[index] : "?"}</span><strong>{snapshot.inventory[index] > 0n ? item.name : "UNDISCOVERED"}</strong><b>×{snapshot.inventory[index].toString()}</b></div>)}</div>
      <button type="button" className="rf-frame-primary full" onClick={() => setScreen("yard")}>BACK TO THE POTTY</button>
    </GameMenu>}

    {screen === "settings" && <GameMenu title="STALL SETTINGS" onClose={() => setScreen("yard")}>
      <button type="button" className="setting" aria-pressed={!muted} onClick={() => { const next = !muted; setMuted(next); sound.current?.setMuted(next); if (next) music.current?.pause(); else { void sound.current?.unlock(); void music.current?.play().catch(() => undefined); } }}>SOUND + MUSIC: {muted ? "OFF" : "ON"}</button>
      <label className="setting"><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /> REDUCE MOTION</label>
      <p className="menu-intro">All RF spending, outcomes and collectibles are simulated for this Vibeathon preview. Reloading resets the session.</p>
    </GameMenu>}
  </section>;
}
