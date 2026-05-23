# Meta-Hive

**Multi-agent hive orchestration system for the pi coding agent.**

[![npm version](https://img.shields.io/npm/v/meta-hive.svg)](https://www.npmjs.com/package/meta-hive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Talk to pi - No Commands Needed!

**Just tell pi what you want!** The skill understands natural language and runs everything for you.

```
You: "Create a new hive for me"
pi:  Runs meta-hive init for you ✓

You: "Add a new profile called laptop"  
pi:  Runs meta-hive join for you ✓

You: "Set my project to my-app"
pi:  Uses meta_hive_set_project tool ✓

You: "Show me the hive status"
pi:  Runs meta-hive status and shows you ✓

You: "Create a new project called my-app"
pi:  Runs meta-hive project add for you ✓
```

**That's it!** No terminal commands needed. Just talk to pi like you're asking a friend.

---

## Quick Start

### 1. Install the skill

```bash
npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive
```

### 2. Just tell pi what you want!

| Say this to pi... | pi will do this... |
|-------------------|---------------------|
| "Create a new hive" | Creates `.meta-hive/` folder |
| "Add a profile called laptop" | Joins hive as laptop profile |
| "Set my active project to my-app" | Sets your project |
| "Show hive status" | Shows all profiles & info |
| "List all profiles" | Lists everyone in hive |
| "Create a project called new-app" | Adds new project |
| "Scan the hive" | Scans all profiles (leader) |
| "I want to leave the hive" | Removes your profile |

### 3. That's it!

pi handles everything. You just talk.

---

## What is Meta-Hive?

Meta-hive connects multiple pi agent profiles through a shared folder, creating a collective intelligence system.

```
┌─────────────────────────────────────┐
│           The Hive                   │
│  ┌─────────┐      ┌─────────────┐   │
│  │ Leader  │ ←──→ │   Human     │   │
│  └────┬────┘      └─────────────┘   │
│       │                               │
│  ┌────┴─────────────────────┐        │
│  │     Profiles             │        │
│  │  ┌─────┐ ┌─────┐ ┌────┐ │        │
│  │  │ P1  │ │ P2  │ │ P3 │ │        │
│  │  └──┬──┘ └──┬──┘ └──┬─┘ │        │
│  └─────┼───────┼───────┼───┘        │
│        └───────┴───────┘            │
│              ↓                      │
│  ┌─────────────────────────┐      │
│  │      Projects            │      │
│  │  ┌─────┐ ┌─────┐ ┌────┐ │      │
│  │  │ prj1│ │ prj2│ │ prj3│ │      │
│  │  └─────┘ └─────┘ └─────┘ │      │
│  └─────────────────────────┘      │
└─────────────────────────────────────┘
```

---

## Features

- **🎤 Natural Language** - Just tell pi what you want
- **🤖 Multi-profile orchestration** - Connect multiple pi profiles
- **👑 Leader-based coordination** - One profile orchestrates the hive
- **🧠 Shared memory** - Profiles share learnings through agentmemory
- **📝 Obsidian compatible** - All data in markdown
- **⚡ Fast setup** - Ready in seconds

---

## Usage Examples

### "Create a new hive for me"
```
You → pi: "Create a new hive for me"
pi → Runs: meta-hive init --name .meta-hive --profile leader
```

### "Add my laptop as a new profile"
```
You → pi: "Add my laptop as a new profile"  
pi → Runs: meta-hive join /path/to/.meta-hive --profile laptop
```

### "Work on my-app project"
```
You → pi: "Set my active project to my-app"
pi → Uses: meta_hive_set_project tool
```

### "How's the hive doing?"
```
You → pi: "Show me the hive status"
pi → Runs: meta-hive status
        meta-hive profiles
```

---

## For Power Users

### CLI Commands

If you prefer terminal commands:

```bash
npx meta-hive init --name .meta-hive --profile leader    # Create hive
npx meta-hive join /path/to/.meta-hive --profile name    # Join hive
npx meta-hive status                                     # Show status
npx meta-hive profiles                                   # List profiles
npx meta-hive project add <name>                         # Add project
npx meta-hive scan                                       # Scan hive
npx meta-hive leave                                      # Leave hive
```

### pi Extension

For deeper integration, copy the extension:

```bash
cp -r ~/.pi/agent/extensions/meta-hive
```

This enables:
- Hive context injection on every turn
- Custom tools (meta_hive_status, etc.)
- Auto-detection of hive connection

---

## Hive Structure

```
.meta-hive/
├── .hive-manifest.json     # Registry of all profiles
├── leader/                  # Leader profile (you)
│   ├── identity.md          # Identity & personality
│   ├── system-prompt.md     # System instructions
│   └── memory/              # agentmemory
├── profiles/                # Other profiles
│   └── laptop/
├── human/                   # Your profile
│   ├── profile.md           # Your preferences
│   └── feedback/            # Feedback files
└── projects/               # Project workspaces
    └── project-name/
```

---

## Installation

### Option 1: Skill (Recommended)

```bash
npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive
```

### Option 2: Global CLI

```bash
npm install -g meta-hive
```

### Option 3: Use Without Install

```bash
npx meta-hive <command>
```

---

## Quick Reference

| What you want | Just say to pi |
|---------------|----------------|
| Create a hive | "Create a new hive" |
| Add a profile | "Add a profile called [name]" |
| Set project | "Set my project to [name]" |
| Check status | "Show hive status" |
| List profiles | "Show me all profiles" |
| New project | "Create a project called [name]" |
| Scan hive | "Scan the hive" (leader) |
| Leave hive | "Leave the hive" |

---

## How It Works

1. **Tell pi** what you want to do
2. **pi runs** the appropriate commands
3. **Hive updates** with your changes
4. **You're done!**

No memorization needed. pi handles the details.

---

## Opening a Profile in pi

**Each profile connects via `hive-config.json` in their working directory.**

To open a profile:
1. Navigate to the directory with `hive-config.json`
2. Start pi in that directory
3. pi auto-detects the profile

```
Project A/                    Project B/
├── hive-config.json  (laptop) ├── hive-config.json (laptop)
└── code/                     └── code/
```

**Same profile, different projects.** Just open pi in the folder you want to work on.

To switch profiles: Open pi in a directory with a different `hive-config.json`.

---

## Privacy

- Single user control
- Local folder-based
- No cloud dependencies
- All data in your control

---

## License

MIT