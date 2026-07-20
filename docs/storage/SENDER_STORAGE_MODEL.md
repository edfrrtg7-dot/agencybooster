# Sender Storage Model

Internal technical documentation of the `chat-sender-<id>` localStorage structure as used by Companion and the original AgencyBooster sender.

Verified through code analysis and live testing on GoldenBride.

---

## Storage Key Pattern

All sender profiles are stored under keys matching:

```
chat-sender-<id>
```

Where `<id>` is a numeric profile identifier. The prefix is defined in `CONFIG.STORAGE_PREFIX` (line 28).

Validation regex: `^chat-sender-\d+$` (line 123).

---

## Root Fields

Every `chat-sender-<id>` profile is a JSON object. The following fields have been verified:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | IceBreaker engine status: `"stopped"`, `"running"`, `"progress"`, `"paused"` |
| `messages` | `object` | IceBreaker message snippets, keyed by string-indexed message ID (`"1"`, `"2"`, ...) |
| `chainProgress` | `object` | Active IceBreaker chain steps, keyed by channel ID |
| `sended` | `string` | Semicolon-delimited IDs of completed IceBreaker chains |
| `delivered` | `string` | Semicolon-delimited IDs of confirmed-delivered IceBreaker chains |
| `broadcast` | `object` | Broadcast module state (nested, see [Broadcast](#broadcast)) |

Additional fields may exist in the original AgencyBooster sender but are not referenced by Companion: `activeTab`, `specified`, `advanced`, `ignore`. These are part of the sender application, not this codebase.

---

## chainProgress

### Purpose

Stores the current in-progress state of active IceBreaker (private) and broadcast chains. Each entry represents a single chain step that has been initiated but not yet completed.

### Structure

```js
data.chainProgress = {
    "<channelId>": {
        channel: "private" | <other>,
        // Additional opaque fields from the sender application:
        // stepsKey, sentIndexes, deliveredIndexes, nextIndex, availableAt, updatedAt
    }
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `channel` | `string` | Channel type. `"private"` identifies IceBreaker private chains. Other values indicate non-private channels. This is the only sub-field explicitly checked by Companion (line 451). |

### Private vs Broadcast Entries

- **Private entries**: `value.channel === "private"`. These are targeted by Reset IceBreaker for removal.
- **Non-private entries**: Any entry where `channel` is not `"private"`. These are preserved during Reset IceBreaker.

### How Companion Uses It

- `StateManager.getInProgressCount()` (line 418-423): Counts entries via `Object.keys(data.chainProgress).length`
- `ResetManager.resetIceBreaker()` (line 444-471): Filters out entries with `channel: "private"`, preserves others
- `ResetManager.resetBroadcast()` (line 473-485): Sets `data.broadcast.chainProgress = {}`
- `ResetManager.newShift()` (line 487-503): Sets `data.chainProgress = {}` (clears everything)

---

## sended

### Purpose

Tracks which IceBreaker chains have been **sent** by the sender. Each completed chain appends its channel ID to this string.

### Format

Semicolon-delimited string of channel IDs:

```
"102345;102346;102350"
```

Empty string `""` when no chains have been sent or after a full reset.

### How Companion Uses It

- `StateManager.getCompletedCount()` (line 425-433): Counts completed chains via `data.sended.split(';').filter(Boolean).length`
- `ResetManager.resetIceBreaker()` (line 459-460): Filters out IDs belonging to `channel: "private"` chains, preserves non-private IDs
- `ResetManager.newShift()` (line 490): Clears entirely to `""`
- Diagnostics (lines 508, 1041, 1413, 1652): Reports count for diagnostics

### Verified Behaviour

- `sended` is written by the original AgencyBooster sender application, not by Companion
- Companion only reads the count and filters during resetIceBreaker
- Filtering preserves non-private IDs so that broadcast completed count is not affected by IceBreaker reset

---

## delivered

### Purpose

Tracks which chains have been **confirmed delivered** — a step beyond "sent". The original AgencyBooster Completed counter is based on this field.

### Format

Semicolon-delimited string of channel IDs, same format as `sended`:

```
"102345;102346;102350"
```

### How Companion Uses It

- `ResetManager.resetIceBreaker()` (line 462-464): Clears to `""` (guarded by `"delivered" in data`)
- `ResetManager.newShift()` (line 491): Clears to `""`
- Diagnostics (lines 507, 1040, 1412, 1651): Reports count for diagnostics

### Verified Behaviour

- `delivered` is written by the original AgencyBooster sender application, never by Companion
- Companion only reads the count and clears during resetIceBreaker and newShift
- The original AgencyBooster Completed counter reads from `delivered`, not from `sended`
- Clearing only `chainProgress` and `sended` during reset is insufficient — the original Completed counter remains stale unless `delivered` is also cleared

---

## Broadcast

### Purpose

The `broadcast` field contains all state for the Broadcast module, mirroring the top-level structure for broadcast-specific operations.

### Structure

```js
data.broadcast = {
    status:        string,    // "stopped" | "running" | "progress" | "paused"
    messages:      object,    // Broadcast message snippets, keyed by string-indexed ID
    chainProgress: object,    // Active broadcast chain steps, keyed by channel ID
    sended:        string     // Semicolon-delimited completed broadcast IDs
}
```

### Why Broadcast Is Preserved During Reset IceBreaker

Reset IceBreaker targets only private IceBreaker chains. Broadcast state is intentionally untouched because:

1. Broadcast chains use different channels (not `channel: "private"`)
2. Broadcast messages and their progress are independent of IceBreaker
3. Resetting broadcast state during an IceBreaker reset would destroy active broadcast chains

### How Companion Uses Broadcast

- `StateManager.getModuleStatus(data, "broadcast")` (line 384): Reads `data.broadcast?.status`
- `StateManager.getInProgressCount(data, "broadcast")` (line 421): Counts `data.broadcast.chainProgress` entries
- `StateManager.getCompletedCount(data, "broadcast")` (line 428): Counts `data.broadcast.sended` entries
- `StateManager.getDelayValue(data, "broadcast")` (line 401): Reads `data.broadcast.messages` for delay detection
- `ResetManager.resetBroadcast()` (line 473-485): Clears `chainProgress`, `sended`, `status` — preserves `messages`

---

## messages

### Purpose

Stores the message snippets (templates) used by the sender. Each message has text content and a delay value.

### Structure

```js
data.messages = {
    "1": { text: "Hello", intervalSeconds: 0 },
    "2": { text: "Follow-up", intervalSeconds: 65 },
    "3": { text: "Another", intervalSeconds: 65 }
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| Text property | `string` | Message content. Property name is auto-detected by `SnippetManager.detectTextProperty()` (line 578-592). Common names: `"text"`, or any string property that is not a delay property. |
| Delay property | `number` | Delay in seconds before this message is sent. Property name is auto-detected by `DelayManager.detectDelayProperty()` (line 521-531). Known names: `"intervalSeconds"`, `"delay"`, `"interval"`, `"timeout"`, `"seconds"` (defined in `CONFIG.DELAY_PROPERTIES`, line 40). |

### How Companion Uses It

- `StateManager.getDelayValue()` (line 400-416): Reads messages to detect the delay property and find the most frequent non-zero delay value
- `DelayManager.applyDelays()` (line 543-548): Updates delay values across all messages
- `SnippetManager.buildMessages()` (line 594-625): Builds message objects from imported snippets. First message always gets delay `0`; subsequent messages get the configured delay value.

### Reset Behaviour

- `data.messages` is **never modified** by `resetIceBreaker`, `resetBroadcast`, or `newShift`
- Message snippets are preserved across all reset operations

---

## Reset IceBreaker

### Purpose

Return the original AgencyBooster sender to the same state as if no private IceBreaker chains had been started. Preserves broadcast state, message snippets, and settings.

### Fields Modified

| Field | New Value | Reason |
|-------|-----------|--------|
| `data.chainProgress` | Filtered copy (private entries removed) | Remove active private chain state while preserving non-private chains |
| `data.sended` | Filtered string (private IDs removed) | Remove completed private chain IDs while preserving non-private completed IDs |
| `data.delivered` | `""` (empty string) | Clear delivered state so the original AgencyBooster Completed counter resets. Guarded by `"delivered" in data`. |
| `data.status` | `"stopped"` | Stop the IceBreaker engine |

### Fields Never Modified

| Field | Reason |
|-------|--------|
| `data.messages` | Message snippets are configuration, not runtime state |
| `data.broadcast.*` | Broadcast is independent; its chains, messages, and status are unaffected |
| `data.delivered` (during broadcast reset) | Broadcast has no `delivered` field |
| Any other root field | Only the four fields above are touched |

### Key Difference from newShift

`newShift` performs a full clear of both IceBreaker and Broadcast state. `resetIceBreaker` is selective: it filters private channels from `chainProgress` and `sended`, but leaves non-private entries intact.

---

## Verified Behaviour

The following findings were confirmed experimentally through code analysis, storage snapshots, and live testing on GoldenBride.

- Original AgencyBooster Completed counter depends on `delivered`, not `sended`
- `chainProgress` stores active chain state; entries with `channel: "private"` are targeted by Reset IceBreaker
- `sended` stores completed chain IDs; Reset IceBreaker filters out private IDs while preserving non-private
- `delivered` stores confirmed-delivered chain IDs; Reset IceBreaker clears it entirely
- Broadcast state survives Reset IceBreaker — `broadcast.chainProgress`, `broadcast.sended`, `broadcast.status`, and `broadcast.messages` are untouched
- `data.messages` (message snippets) is never modified by any reset operation
- Companion Dashboard and original AgencyBooster use different logic for some counters: Companion reads `sended` for Completed, original reads `delivered`
- `newShift` is a full clear of both IceBreaker and Broadcast runtime state; `resetIceBreaker` is selective
