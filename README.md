# Meta-Hive

**Multi-agent hive orchestration system for the pi coding agent.**

[![npm version](https://img.shields.io/npm/v/meta-hive.svg)](https://www.npmjs.com/package/meta-hive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Quick Install

```
Install the meta-hive skill:
1. First, create a hive: npx meta-hive init --name .meta-hive --profile leader
2. Then add the skill: npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive
3. For extension features: copy src/extension to ~/.pi/agent/extensions/meta-hive
```

## What is Meta-Hive?

Meta-hive connects multiple pi agent profiles through a shared folder, creating a collective intelligence system. Each profile has its own identity, memory, context, and capabilities.

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

## Features

- **Multi-profile orchestration** - Connect multiple pi profiles
- **Leader-based coordination** - One profile orchestrates the hive
- **Shared memory** - Profiles share learnings through agentmemory
- **Obsidian compatible** - All data in markdown, viewable in Obsidian
- **pi Extension** - Full lifecycle hooks, custom tools, context injection
- **CLI commands** - Easy management of hive and profiles

## Installation

### CLI Tool (Global)

```bash
npm install -g meta-hive
```

### Use Without Install

```bash
npx meta-hive <command>
```

### pi Extension

Copy the extension to pi's extensions directory:

```bash
# Create extension directory
mkdir -p ~/.pi/agent/extensions

# Clone/copy the extension
cp -r /path/to/meta-hive/src/extension ~/.pi/agent/extensions/meta-hive
```

The extension auto-discovers on pi startup and provides:
- Hive context injection on session start
- Custom tools (meta_hive_status, meta_hive_scan, etc.)
- Custom commands (/hive-status, /hive-scan)

### pi Skill

```bash
npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive
```

## Commands

### CLI Commands

```bash
npx meta-hive init --name .meta-hive --profile leader    # Create new hive
npx meta-hive join /path/to/.meta-hive --profile name   # Join existing hive
npx meta-hive status                                      # Show hive status
npx meta-hive profiles                                    # List all profiles
npx meta-hive project add <name>                         # Add project
npx meta-hive project list                               # List projects
npx meta-hive scan                                       # Scan hive (leader)
npx meta-hive leave                                      # Leave hive
npx meta-hive human                                      # Human profile info
```

### pi Extension Tools

When the extension is loaded, these tools are available:

- `meta_hive_status` - Get current hive status
- `meta_hive_scan` - Scan hive for insights (leader only)
- `meta_hive_set_project` - Set active project
- `meta_hive_list_profiles` - List all profiles

### pi Extension Commands

- `/hive-status` - Quick status check
- `/hive-scan` - Trigger hive scan (leader)

## Hive Structure

```
.meta-hive/
├── .hive-manifest.json     # Registry of all profiles
├── leader/                  # Leader profile
│   ├── identity.md          # Identity & personality
│   ├── system-prompt.md     # System instructions
│   ├── memory/              # agentmemory
│   ├── context/             # Working context
│   ├── skills/              # Custom skills
│   └── extensions/          # Extensions
├── profiles/                # Other profiles
│   └── profile-name/
│       ├── identity.md
│       ├── system-prompt.md
│       ├── memory/
│       ├── context/
│       ├── skills/
│       └── extensions/
├── human/                   # Human profile
│   ├── profile.md           # Your preferences
│   └── feedback/             # Feedback files
├── projects/               # Project workspaces
│   └── project-name/
└── shared/                 # Shared learnings
    ├── skills/
    └── learnings/
```

## Extension Behavior

### Session Lifecycle

1. **session_start**: Loads hive config from `hive-config.json`
2. **before_agent_start**: Injects hive context into agent prompts
3. **Custom tools**: Available for LLM to call during conversation

### Context Injection

**Leader profile receives:**
- Full hive overview
- All profile identities
- Active projects

**Regular profiles receive:**
- Their own identity
- Active project context

## For pi Users

### Install as Skill

```bash
npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive
```

Then use commands in your conversations:

```
/meta-hive status
/meta-hive profiles
/meta-hive scan
/meta-hive project add my-project
```

### Install as Extension

```bash
cp -r ~/.pi/agent/extensions/meta-hive
# Restart pi
```

Use tools directly:

```
Use meta_hive_status to check the hive status
Use meta_hive_scan to scan the hive
```

## How It Works

1. **Create a hive** with `meta-hive init`
2. **Install extension** by copying to `~/.pi/agent/extensions/`
3. **Create profiles** on different devices with `meta-hive join`
4. **Each profile works** on assigned projects
5. **Leader monitors** and coordinates (you control everything)
6. **Edit Obsidian files** to modify profiles and provide feedback

## Key Concepts

- **Profile**: A pi agent with its own identity, memory, and skills
- **Leader**: Special profile you create - orchestrates the hive
- **Human**: Your profile for preferences and feedback
- **Projects**: Profiles work on projects, inferred from folder structure

## Privacy

- Single user control
- Local folder-based
- No cloud dependencies
- All data in your control

## License

MIT