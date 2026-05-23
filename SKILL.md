---
name: meta-hive
description: Multi-agent hive orchestration system for pi. Connects multiple pi profiles through a shared folder, creating a collective intelligence system. Use when you need to manage multiple agent profiles, create a leader agent, or set up a hive of coordinated agents.
---

# Meta-Hive

Multi-agent hive orchestration system for the pi coding agent.

## Overview

Meta-hive connects multiple pi agent profiles through a shared folder, creating a collective intelligence system. Each profile has its own identity, memory, context, and capabilities.

## Hive Structure

```
.meta-hive/                    # Hive root (shared folder)
├── .hive-manifest.json        # Registry: profiles, leader, settings
├── leader/                    # Leader profile (user-created)
│   ├── identity.md            # Identity, personality, meta capabilities
│   ├── system-prompt.md        # Leader's system instructions
│   ├── memory/                # agentmemory instance
│   ├── context/               # Current working context
│   ├── skills/                # Leader's skills
│   └── extensions/            # Leader's extensions
├── profiles/                  # All profile directories
│   └── profile-name/
│       ├── identity.md        # Profile identity
│       ├── system-prompt.md   # Profile's system instructions
│       ├── memory/            # agentmemory instance
│       ├── context/          # Projects list, active context
│       ├── skills/            # Profile's skills
│       └── extensions/        # Profile's extensions
├── human/                     # Human profile
│   ├── profile.md             # Name, preferences, context
│   └── feedback/              # Feedback for the hive
└── projects/                  # Project workspaces
    └── project-name/
        └── profile-name/      # Profile's work in this project
```

## Commands

### `/meta-hive init`

Initialize a new hive with a leader profile.

```bash
npx meta-hive init --name .meta-hive --profile leader
```

Creates:
- Hive folder structure
- Leader profile
- Human profile template
- Manifest file

### `/meta-hive join <path>`

Join an existing hive.

```bash
npx meta-hive join /path/to/.meta-hive --profile my-profile --projects my-project
```

Creates your profile in the hive.

### `/meta-hive status`

Show hive status.

```bash
npx meta-hive status
```

Shows:
- Hive path and version
- Leader info
- All profiles
- Active projects
- Hive insights

### `/meta-hive profiles`

List all profiles.

```bash
npx meta-hive profiles
```

### `/meta-hive scan`

Scan the hive (for leader).

```bash
npx meta-hive scan
```

### `/meta-hive project add <name>`

Add a project to the hive.

### `/meta-hive project list`

List all projects.

### `/meta-hive leave`

Leave the current hive.

### `/meta-hive human`

Show human profile info.

## Key Concepts

- **Profile**: A pi agent with its own identity, memory, context, and skills. Profiles are sticky to projects.
- **Leader**: Special profile with meta capabilities. Created manually by the user. Monitors the hive.
- **Human**: The user has a profile for preferences and feedback.
- **Projects**: Folders where profiles work. Multiple profiles can collaborate.

## When to Use

- Set up a new hive for multi-agent coordination
- Join an existing hive from a new device
- Check hive status and insights
- Manage profiles and projects
- Coordinate multiple agent profiles

## Installation

```bash
npx meta-hive init --name .meta-hive --profile leader
npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive
```