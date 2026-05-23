---
name: meta-hive
description: Multi-agent hive orchestration system for pi. Connects multiple pi profiles through a shared folder, creating a collective intelligence system. Use when you need to manage multiple agent profiles, create a leader agent, or set up a hive of coordinated agents.
---

# Meta-Hive

Multi-agent hive orchestration system for the pi coding agent.

## Overview

Meta-hive connects multiple pi agent profiles through a shared folder, creating a collective intelligence system. Each profile has its own identity, memory, context, and capabilities. A leader profile orchestrates the entire hive.

## Hive Structure

```
.meta-hive/                    # Hive root (shared folder)
├── .hive-manifest.json        # Registry: profiles, leader, settings
├── leader/                    # Leader profile (user-created)
│   ├── identity.md            # Identity, personality, meta capabilities
│   ├── system-prompt.md       # Leader's system instructions
│   ├── memory/                # agentmemory instance
│   ├── context/               # Current working context
│   ├── skills/                # Leader's skills
│   └── extensions/            # Leader's extensions
├── profiles/                  # All profile directories
│   ├── profile-name/
│   │   ├── identity.md        # Profile identity
│   │   ├── system-prompt.md   # Profile's system instructions
│   │   ├── memory/            # agentmemory instance
│   │   ├── context/           # Projects list, active context
│   │   ├── skills/            # Profile's skills
│   │   └── extensions/        # Profile's extensions
├── human/                     # Human profile
│   ├── profile.md             # Name, preferences, context
│   └── feedback/              # Feedback for the hive
└── projects/                  # Project workspaces
    └── project-name/
        └── profile-name/      # Profile's work in this project
```

## Setup

### Initialize a new hive

```bash
npx meta-hive init --name .meta-hive --profile leader
```

### Join an existing hive

```bash
npx meta-hive join /path/to/.meta-hive --profile my-profile --projects project-a project-b
```

### Check status

```bash
npx meta-hive status
npx meta-hive profiles
```

## Usage

### When working with meta-hive:

1. **Initialize or join a hive** using the commands above
2. **The hive folder is automatically created** with all necessary structure
3. **Leader profile monitors** all profiles and provides insights
4. **Edit files in Obsidian** to modify profile identities and give feedback
5. **All profiles share** the same hive folder for coordination

### Key concepts:

- **Profile**: A pi agent with its own identity, memory, and skills
- **Leader**: Special profile with meta capabilities (create manually, user-assigned)
- **Human**: You have a profile for preferences and feedback
- **Projects**: Profiles work on projects, inferred from folder structure

### Workflow:

1. Create a hive with `init`
2. Create profiles with `join` on different devices
3. Each profile works on assigned projects
4. Leader (you) monitors and coordinates
5. Edit Obsidian files to provide feedback

## Files

- `.hive-manifest.json` - Registry of all profiles
- `identity.md` - Profile's identity and personality
- `system-prompt.md` - Profile's system instructions
- `projects.json` - Profile's assigned projects
- `context/` - Current working context
- `memory/` - agentmemory data
- `skills/` - Profile's custom skills
- `extensions/` - Profile's extensions