---
name: meta-hive
description: Multi-agent hive orchestration system for pi. Connects multiple pi profiles through a shared folder, creating a collective intelligence system. Use when you need to manage multiple agent profiles, create a leader agent, or set up a hive of coordinated agents. Provides /meta-hive commands, meta_hive_* tools, and session lifecycle hooks.
---

# Meta-Hive

Multi-agent hive orchestration system for the pi coding agent.

## Overview

Meta-hive connects multiple pi agent profiles through a shared folder, creating a collective intelligence system. Each profile has its own identity, memory, context, and capabilities. A leader profile orchestrates the entire hive.

## Installation

```bash
# Install CLI globally
npm install -g meta-hive

# Add as pi skill (after CLI is installed)
npx skills add https://github.com/rishi-ie/meta-hive --skill meta-hive

# Install as pi extension (auto-discovers in ~/.pi/agent/extensions/)
# Copy or link the extension file:
cp -r /path/to/meta-hive/src/extension ~/.pi/agent/extensions/meta-hive
# Or use npm package when published
```

## Quick Start

```bash
# 1. Create a new hive
npx meta-hive init --name .meta-hive --profile leader

# 2. In pi, use commands or tools
/meta-hive status
/meta-hive profiles
/meta-hive scan
```

## Hive Structure

```
.meta-hive/
├── .hive-manifest.json     # Registry of all profiles
├── leader/                  # Leader profile
│   ├── identity.md
│   ├── system-prompt.md
│   ├── memory/
│   ├── context/
│   ├── skills/
│   └── extensions/
├── profiles/                # Other profiles
│   └── profile-name/
├── human/                   # Human profile
│   ├── profile.md
│   └── feedback/
└── projects/               # Project workspaces
```

## Available Tools

### `meta_hive_status`
Get current hive status - shows manifest, profiles, and role.

### `meta_hive_scan`
Leader-only scan of all profiles and generate insights.

### `meta_hive_set_project`
Set the active project for this profile.

### `meta_hive_list_profiles`
List all profiles in the hive with their details.

## Available Commands

### `/meta-hive init`
Create a new hive with a leader profile.

```bash
npx meta-hive init --name .meta-hive --profile leader
```

### `/meta-hive join <path>`
Join an existing hive as a new profile.

```bash
npx meta-hive join /path/to/.meta-hive --profile my-laptop --projects my-app
```

### `/meta-hive status`
Show hive status.

### `/meta-hive profiles`
List all profiles.

### `/meta-hive project add <name>`
Add a project to the hive.

### `/meta-hive scan`
Scan the hive (leader only).

### `/meta-hive leave`
Leave the current hive.

## Extension Features

The pi extension provides:

- **Session lifecycle hooks**: Loads hive config on session start
- **Context injection**: Injects hive context into agent prompts
- **Custom tools**: meta_hive_status, meta_hive_scan, meta_hive_set_project, meta_hive_list_profiles
- **Custom commands**: /hive-status, /hive-scan

### Context Injection

When connected to a hive, the extension automatically injects:

**For Leader profile:**
- Full hive overview
- All profile identities
- Active projects

**For regular profiles:**
- Their own identity
- Active project context

## Key Concepts

- **Profile**: A pi agent with its own identity, memory, and skills
- **Leader**: Special profile you create - orchestrates the hive
- **Human**: Your profile for preferences and feedback
- **Projects**: Folders where profiles work

## When to Use

- Setting up a new hive for multi-agent coordination
- Joining an existing hive from a new device
- Checking hive status and insights
- Managing profiles and projects
- Coordinating multiple agent profiles