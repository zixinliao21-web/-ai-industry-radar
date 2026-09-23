# VELNAR Research — Cross-device Sync V1

Status: optional progressive enhancement  
Architecture: local-first + user-configured Upstash Redis REST

## Scope

Sync V1 covers only:
- read / unread state for Industry Radar, Consumer Radar and Weekly Deep Read;
- most recently opened article;
- monotonic article reading progress;
- speech-reader per-article progress;
- speech rate.

The preferred system voice URI is device-specific and remains local to each device. Sync V1 does **not** sync voice selection, notes, excerpts, discussion-thread URLs, research content, theme, or any canonical JSON data.

## Local-first contract

Every interaction updates local browser state immediately. Cloud sync is asynchronous and optional. If the provider is missing, offline, misconfigured, rate-limited or unavailable, all reading, read/unread, notes and speech features continue locally. Sync must never become a prerequisite for rendering research content.

## Local keys

Sync V1 adds:
```text
velnar-sync-config-v1
velnar-sync-state-v1
velnar-sync-device-v1
velnar-reading-progress-v1
```

Existing speech keys remain:
```text
velnar-reader-progress-v1
velnar-reader-rate-v1
velnar-reader-voice-v1
```

## Remote shape

A dedicated Redis Hash is used per sync identity:
```text
HSET <sync-key> <device-id> <device-state-json>
HGETALL <sync-key>
```

Each device writes only its own field, avoiding whole-document last-write-wins races. Device snapshots intentionally omit the system voice URI because voice identifiers are not portable across operating systems.

Merge rules:
- read/unread: latest explicit timestamp wins;
- recent article: latest timestamp wins;
- reading progress: maximum progress wins to prevent regression;
- speech progress with the same body fingerprint: maximum segment index and completed=true wins;
- speech progress with different fingerprints: newer record wins; the speech reader's fingerprint check prevents stale progress from applying to changed text;
- speech rate: latest timestamp wins;
- system voice: never merged across devices; each device keeps its own local voice URI.

## Provider / credential boundary

The repository contains no Redis URL or token. The user supplies a dedicated Upstash REST URL and token in the browser; both stay in localStorage. A generated VRS1 connection code contains these credentials and must be treated like a password and transferred only between the user's own devices.

Use a dedicated database for Radar Sync rather than credentials that protect unrelated application data.

## Failure and rollback

Disconnecting removes only provider configuration. Local reading state remains intact. Removing `assets/state-sync.js` and its script references fully removes Sync V1 without changing research data.
