# Meta-Hive

**Multi-agent hive orchestration system for the pi coding agent.**

[![npm version](https://img.shields.io/npm/v/meta-hive.svg)](https://www.npmjs.com/package/meta-hive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Quick Install

Copy and paste this prompt to install meta-hive:

```
Install the meta-hive skill:
1. Run: npx meta-hive init --name .meta-hive --profile leader
2. Then run: npx skills add /Users/rishi/work/projects/meta-hive --skill meta-hive
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
- **Simple commands** - Easy CLI for hive management

## Installation

```bash
npm install -g meta-hive
```

Or use without installation:

```bash
npx meta-hive <command>
```

## Commands

### `init` - Create a new hive

```bash
meta-hive init --name .meta-hive --profile leader
```

Creates a new hive with:
- `.hive-manifest.json` - Registry
- `leader/` - Leader profile directory
- `profiles/` - Other profiles directory
- `projects/` - Projects directory
- `human/` - Human profile
- `shared/` - Shared learnings

### `join` - Join an existing hive

```bash
meta-hive join /path/to/.meta-hive --profile my-laptop --projects my-app
```

Creates your profile in the hive.

### `status` - Show hive status

```bash
meta-hive status
```

Shows:
- Leader info
- All profiles
- Active projects
- Hive insights

### `profiles` - List profiles

```bash
meta-hive profiles
```

Lists all profiles with their details.

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
├── human/                   # Human profile
│   ├── profile.md
│   └── feedback/
└── projects/               # Project workspaces
    └── project-name/
```

## For pi Users

Add to your pi skills to use meta-hive commands directly:

```bash
npx skills add /path/to/meta-hive --skill meta-hive
```

Then use commands like `/meta-hive status` in your conversations.

## How It Works

1. **Create a hive** with `meta-hive init`
2. **Create profiles** on different devices with `meta-hive join`
3. **Each profile works** on assigned projects
4. **Leader monitors** and coordinates (you control everything)
5. **Edit Obsidian files** to modify profiles and provide feedback

## Privacy

- Single user control
- Local folder-based
- No cloud dependencies
- All data in your control

## License

MIT