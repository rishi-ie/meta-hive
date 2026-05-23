---
name: meta-hive
description: Multi-agent hive orchestration system for pi. Connects multiple pi profiles through a shared folder. Use when the user wants to create hives, manage profiles, customize identities, set up projects, switch between profiles, or coordinate multiple agents. Provides /meta-hive, /profile, /hive commands.
---

# Meta-Hive

Multi-agent hive orchestration system. Connect multiple pi profiles through a shared folder.

## Available Commands

| Command | Description |
|---------|-------------|
| `/meta-hive init` | Create a new hive |
| `/meta-hive join <name> [projects...]` | Add a new profile |
| `/meta-hive status` | Show hive status |
| `/meta-hive profiles` | List all profiles |
| `/meta-hive project add <name>` | Add a project |
| `/meta-hive project list` | List projects |
| `/meta-hive scan` | Scan hive (leader only) |
| `/meta-hive leave` | Leave hive (profiles only) |
| `/profile` | View and select profiles |
| `/hive` | Quick hive status |

---

## Creating a Hive

```
User: "Create a new hive"
You:   /meta-hive init
```

---

## Creating a Profile (with custom identity!)

Just tell me the details - I'll handle everything:

```
User: "Create a profile called laptop, a backend developer who loves Node.js and TypeScript"
You:   /meta-hive join laptop --identity "Backend developer specializing in Node.js and TypeScript"

User: "Add a profile called dev-bot who is helpful, uses Python, and works on APIs"
You:   /meta-hive join dev-bot --projects api-project --identity "Helpful developer using Python for APIs"

User: "Create a mobile profile for me, iOS developer with Swift experience"
You:   /meta-hive join mobile --projects ios-app --identity "iOS developer with Swift expertise"
```

### Profile Details I Can Set:
- **Name** (required): What to call the profile
- **Identity** (optional): Who they are, their expertise
- **Projects** (optional): What they're working on

### Example Profile Creation Flow:

```
User: "I want a new profile for frontend work"
You:   What would you like to name it?
User: "frontend-dev"
You:   What's their focus or expertise?
User: "React and CSS specialist"
You:   What project should they work on?
User: "web-app"
You:   /meta-hive join frontend-dev --identity "React and CSS specialist" --projects web-app

✅ Profile "frontend-dev" created!
```

---

## Viewing Profiles

```
User: "/profile"
You:   (Shows interactive list of all profiles)

User: "/meta-hive profiles"
You:   (Shows detailed list)
```

---

## Setting Active Project

```
User: "Set my project to web-app"
You:   (Use meta_hive_set_project tool)
```

Or:
```
User: "/meta-hive project add new-project"
User: "Set my project to new-project"
```

---

## Checking Status

```
User: "/meta-hive status"
You:   (Shows hive status)

User: "/hive"
You:   (Quick status notification)

User: "/meta-hive scan"
You:   (Leader-only: full hive scan)
```

---

## Quick Reference

| What you want | Command |
|--------------|---------|
| Create hive | `/meta-hive init` |
| Add profile | `/meta-hive join <name>` |
| View profiles | `/profile` |
| Show status | `/meta-hive status` |
| Add project | `/meta-hive project add <name>` |
| Set project | "Set project to X" |
| Scan hive | `/meta-hive scan` |
| Leave hive | `/meta-hive leave` |

---

## Profile Switching

Each profile is connected via `hive-config.json` in their working directory.

To switch profiles:
1. Navigate to that profile's directory
2. Start a new pi session

The extension auto-detects which profile to use based on `hive-config.json`.