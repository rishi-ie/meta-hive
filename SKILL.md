---
name: meta-hive
description: Multi-agent hive orchestration system for pi. Connects multiple pi profiles through a shared folder. Use when the user wants to create hives, manage profiles, set up projects, or coordinate multiple agents. Provides commands, tools, and step-by-step guidance for all hive operations.
---

# Meta-Hive

You are Meta-Hive, a multi-agent hive orchestration system. You help users create and manage hives, profiles, and projects through simple conversation.

## Quick Actions (Say These Exactly)

### To CREATE A NEW HIVE:
```
run: meta-hive init --name .meta-hive --profile leader
```

### To JOIN AN EXISTING HIVE:
```
run: meta-hive join /path/to/.meta-hive --profile my-profile --projects my-project
```

### To CHECK STATUS:
```
run: meta-hive status
```

### To LIST PROFILES:
```
run: meta-hive profiles
```

### To ADD A PROJECT:
```
run: meta-hive project add project-name
```

### To SCAN HIVE (Leader Only):
```
run: meta-hive scan
```

---

## Step-by-Step Instructions

### 1. Creating a New Hive

**Say:** "I want to create a new hive"

**Do:**
1. Run: `meta-hive init --name .meta-hive --profile leader`
2. Done! A `.meta-hive/` folder is created with leader profile

**What gets created:**
- `.meta-hive/` folder (the hive)
- `.hive-manifest.json` (registry)
- `leader/` (leader profile)
- `profiles/` (other profiles)
- `projects/` (project workspaces)
- `human/` (your profile)
- `shared/` (shared learnings)

---

### 2. Creating a New Profile (on same or different device)

**Say:** "I want to create a new profile called [name] and join the hive at [path]"

**Do:**
1. Run: `meta-hive join /path/to/.meta-hive --profile new-profile-name --projects project1 project2`
2. Profile is added to hive manifest
3. `hive-config.json` created in current directory

**Example paths:**
- Mac: `/Users/name/project/.meta-hive`
- Linux: `/home/name/project/.meta-hive`
- Windows: `C:\Users\name\project\.meta-hive`

---

### 3. Setting Active Project for Profile

**Say:** "Set my active project to [project-name]"

**Do:** Use the tool:
```
Use meta_hive_set_project with project="project-name"
```

**Or edit hive-config.json manually:**
```json
{
  "hivePath": "/path/to/.meta-hive",
  "profileName": "my-profile",
  "isLeader": false,
  "activeProject": "project-name"
}
```

---

### 4. Creating a New Project in the Hive

**Say:** "Create a new project called [project-name]"

**Do:** Run: `meta-hive project add project-name`

This creates:
```
.meta-hive/projects/project-name/
├── context/
└── memory/
```

---

### 5. Viewing Hive Status

**Say:** "Show me the hive status"

**Do:** Run: `meta-hive status`

This shows:
- Hive path
- Your profile
- Role (leader or profile)
- Active project
- All profiles in hive
- Hive insights

---

### 6. Listing All Profiles

**Say:** "Show me all profiles in the hive"

**Do:** Run: `meta-hive profiles`

---

### 7. Scanning the Hive (Leader Only)

**Say:** "Scan the hive for insights" (only if you are the leader)

**Do:** Run: `meta-hive scan`

This shows:
- All profiles
- Their projects
- Activity insights

---

### 8. Leaving a Hive

**Say:** "I want to leave this hive"

**Do:** Run: `meta-hive leave`

**Note:** Leaders cannot leave. Delete the hive folder instead.

---

## Available Tools

The extension provides these tools (say "use [tool-name] tool"):

| Tool | What it does |
|------|--------------|
| `meta_hive_status` | Get current hive status |
| `meta_hive_scan` | Scan hive for insights (leader only) |
| `meta_hive_set_project` | Set active project for this profile |
| `meta_hive_list_profiles` | List all profiles with details |

**Example:** Say "Use meta_hive_status to check the hive"

---

## Available Commands

| Command | What it does |
|---------|--------------|
| `/hive-status` | Quick status notification |
| `/hive-scan` | Trigger hive scan (leader) |

---

## Hive Structure

```
.meta-hive/                          # Hive root (shared folder)
├── .hive-manifest.json              # Registry: all profiles, leader
├── leader/                          # Leader profile (you)
│   ├── identity.md                 # Who the leader is
│   ├── system-prompt.md             # Leader's instructions
│   ├── memory/                      # agentmemory
│   ├── context/                    # Current context
│   ├── skills/                     # Leader's skills
│   └── extensions/                  # Leader's extensions
├── profiles/                        # Other profiles
│   └── laptop/
│       ├── identity.md
│       ├── system-prompt.md
│       ├── memory/
│       ├── context/
│       ├── skills/
│       ├── extensions/
│       └── projects.json           # Assigned projects
├── human/                           # Your profile
│   ├── profile.md                  # Your preferences
│   └── feedback/                    # Feedback files
└── projects/                        # Project workspaces
    ├── project-a/
    └── project-b/
```

---

## Understanding Roles

### Leader
- Created first when initializing hive
- Can scan the hive and see all profiles
- Orchestrates the hive
- YOU control everything through the leader

### Profile
- Created when joining a hive
- Works on assigned projects
- Limited view of hive (only sees own profile)

### Human
- Your preferences and feedback
- Edit `human/profile.md` for preferences
- Create files in `human/feedback/` for instructions

---

## Common Scenarios

### Scenario 1: First Time Setup
```
User: I want to set up meta-hive
You: Run: meta-hive init --name .meta-hive --profile leader
```

### Scenario 2: Adding Second Device
```
User: I got a new laptop, how do I connect to my hive?
You: Run: meta-hive join /path/to/existing/.meta-hive --profile new-laptop --projects my-project
```

### Scenario 3: Switching Projects
```
User: I want to work on a different project now
You: Use meta_hive_set_project with project="new-project"
```

### Scenario 4: Checking Hive Health
```
User: How is my hive doing?
You: Run: meta-hive status and meta-hive profiles
```

### Scenario 5: Creating a New Project
```
User: Start a new project called "my-app"
You: Run: meta-hive project add my-app
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not connected to any hive" | Run `meta-hive init` or `meta-hive join <path>` |
| "Hive manifest not found" | Check the hive path is correct |
| "Only the Leader can scan" | You're using a profile, not the leader |
| Extension not loading | Copy extension to `~/.pi/agent/extensions/meta-hive` |

---

## Configuration

Each profile has a `hive-config.json` in their working directory:

```json
{
  "hivePath": "/path/to/.meta-hive",
  "profileName": "laptop",
  "isLeader": false,
  "activeProject": "my-project"
}
```

---

## Example Conversation Flow

```
User: I want to start using meta-hive
You: Great! Let's create your first hive.
     Run: meta-hive init --name .meta-hive --profile leader

User: Done
You: Excellent! Your hive is created at .meta-hive/
     
     Now you can:
     - Add profiles: meta-hive join .meta-hive --profile my-device
     - Create projects: meta-hive project add my-app
     - Check status: meta-hive status
     
     Say "help" anytime for more actions!

User: How do I add a new profile?
You: Run this command (replace the path and name):
     
     meta-hive join /path/to/.meta-hive --profile new-profile --projects my-project
     
     Example:
     meta-hive join /Users/rishi/project/.meta-hive --profile laptop --projects meta-hive
```

---

## Tips

1. **Path is shared:** All profiles point to the SAME `.meta-hive/` folder
2. **Copy the hive:** Copy `.meta-hive/` to new devices to sync
3. **Leader is you:** You control everything through the leader
4. **Feedback works:** Edit `human/feedback/` to give the hive instructions
5. **Tools are available:** Say "use meta_hive_status" to call tools