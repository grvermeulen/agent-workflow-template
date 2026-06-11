# Cos Bridge

Lokale terminal-bridge voor The Pit. Draait op je eigen machine en stelt een echte
PTY (PowerShell, optioneel direct `claude`) beschikbaar over een WebSocket met
token-authenticatie. Zo kan de op Vercel gehoste cockpit een volwaardige terminal
tonen die op jouw PC draait — Claude Code gebruikt dan gewoon je Claude-abonnement
(geen API-kosten).

```
Browser (cockpit, xterm.js) ──wss──► Cloudflare Tunnel ──► bridge (deze daemon) ──► PTY ──► claude
```

## Snel starten

```powershell
cd bridge
npm install
npm run token          # genereer een token, zet het in bridge/.env
npm start              # luistert op ws://127.0.0.1:7070/term
```

Lokaal testen kan direct: open de cockpit (`npm run dev` in `cockpit/`), ga naar de
terminal, vul `ws://127.0.0.1:7070/term` + je token in.

## Extern bereikbaar maken (Cloudflare Tunnel)

De bridge bindt bewust alleen op `127.0.0.1`. Zet er een uitgaande tunnel voor —
geen poorten openzetten op je router.

```powershell
winget install Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create cos-bridge
cloudflared tunnel route dns cos-bridge terminal.jouwdomein.nl
cloudflared tunnel run --url http://127.0.0.1:7070 cos-bridge
```

In de cockpit gebruik je dan `wss://terminal.jouwdomein.nl/term`.

**Sterk aanbevolen:** zet Cloudflare Access (Zero Trust → Applications) voor de
hostname, met een login-policy op je eigen e-mailadres. Dan is het token de
tweede verdedigingslaag in plaats van de enige.

Alternatief zonder eigen domein: `cloudflared tunnel --url http://127.0.0.1:7070`
geeft een tijdelijke `*.trycloudflare.com`-URL (handig om te testen, niet voor
permanent gebruik). Privé-alternatief: Tailscale — dan is de bridge alleen vanaf
je eigen apparaten bereikbaar.

## Beveiliging

| Maatregel | Detail |
|---|---|
| Verplicht token | min. 32 tekens; daemon start niet zonder. Vergelijking is constant-time (sha256 + `timingSafeEqual`). |
| Auth vóór PTY | authenticatie gebeurt bij de HTTP-upgrade; zonder geldig token wordt er nooit een shell gestart. |
| Rate-limiting | na 5 foute pogingen wordt het IP 15 min geblokkeerd (HTTP 429). |
| Loopback-bind | standaard alleen `127.0.0.1`; de tunnel verzorgt TLS en de buitenkant. |
| Sessielimiet | max 3 gelijktijdige terminals (configureerbaar). |
| Idle-timeout | sessies zonder activiteit worden na 60 min beëindigd. |
| Origin-allowlist | optioneel via `COS_BRIDGE_ALLOWED_ORIGINS` (zet hier je cockpit-domein). |
| Payload-cap | WebSocket-berichten zijn gemaximeerd op 1 MB. |

Let op: wie het token én de URL heeft, heeft een shell op deze machine onder jouw
account. Behandel het token als een wachtwoord, rouleer het bij twijfel
(`npm run token`), en gebruik Cloudflare Access of Tailscale als extra laag.

## Protocol

Client → server (JSON over WebSocket, na upgrade met `?token=…`):

| Bericht | Betekenis |
|---|---|
| `{type:"start", cols, rows, autoClaude}` | start de PTY (eenmalig per verbinding) |
| `{type:"input", data}` | toetsaanslagen |
| `{type:"resize", cols, rows}` | terminalgrootte wijzigen |
| `{type:"ping"}` | keepalive |

Server → client: `{type:"ready", cwd, shell}`, `{type:"data", data}`,
`{type:"exit", code}`, `{type:"error", message}`, `{type:"pong"}`.

`GET /healthz` antwoordt zonder auth met `{"ok":true}` — gebruikt voor
online/offline-detectie; lekt verder niets.

## Tests

```powershell
npm test
```

Draait de security- en end-to-end-suite (`node --test`): auth-weigering,
rate-limiting, sessielimiet en een echte PTY-rondgang.
