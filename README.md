# 🐝 meta-hive

> **One-line setup.** Copy and paste this into your agent:

```
Install and setup meta-hive for pi:
1. Run: git clone https://github.com/rishi-ie/meta-hive ~/meta-hive && cd ~/meta-hive && npm link
2. Run: meta-hive init --name .meta-hive --profile leader
3. Extension auto-loads. Start pi in the leader folder.
```

---

Multi-agent orchestration for [pi](https://github.com/earendil-works/pi-coding-agent). Manage projects with dedicated profiles - each project its own context, no switching.

---

## How it works

```
┌────────────────────────────────────────────────────────────┐
│  LEADER (you)                                              │
│  cd leader-folder && pi                                   │
│  /dashboard → sees all projects + profiles                │
└────────────────────────────────────────────────────────────┘
        │
        ├── web-app ──────────── frontend profile (cd web-app && pi)
        ├── api-service ─────── backend profile (cd api-service && pi)
        └── ios-app ─────────── mobile profile (cd ios-app && pi)
```

- **Project = profiles** (fixed, no switching)
- **Leader** monitors everything
- **Profiles** only see their project
- **Complete context isolation**

---

## Quick start

```bash
# 1. Install
git clone https://github.com/rishi-ie/meta-hive ~/meta-hive
cd ~/meta-hive && npm link

# 2. Create hive
meta-hive init --name .meta-hive --profile leader

# 3. Open pi in the leader folder
cd leader-folder  # or wherever you want to monitor from
pi
```

The extension auto-loads. No linking needed.

---

## Your workflow

### 1. Create a project (leader terminal)

```
You: "Create a new project called web-app"
pi:  /new-project web-app

✅ Project "web-app" created!
Profile "web-app" is dedicated.

To work on it:
1. New terminal
2. cd to web-app folder
3. Start pi
```

### 2. Work on the project (profile terminal)

```
You: "What am I working on?"
pi:  /projects

YOUR PROJECTS
--------------
[active] web-app
```

### 3. Monitor everything (leader terminal)

```
You: "Show me the dashboard"
pi:  /dashboard

HIVE DASHBOARD
----------------

Projects: 3
Profiles: 4

[active] web-app
   Profiles: web-app

[active] api-service
   Profiles: backend
```

### 4. Profile switching

Each profile is in its own directory:

```bash
~/leader/        → pi → Leader (monitoring)
~/web-app/       → pi → web-app profile
~/api-service/   → pi → backend profile
~/ios-app/       → pi → mobile profile
```

To switch: `cd` to that directory and start pi.

---

## Commands

| Command | Who | What |
|---------|-----|------|
| `/new-project <name> [profile]` | Leader | Create project + profile |
| `/dashboard` | Leader | See all projects + profiles |
| `/projects` | All | List your projects |
| `/profiles` | All | List all profiles |
| `/hive` | All | Quick status |
| `/meta-hive status` | All | Detailed status |
| `/meta-hive scan` | Leader | Refresh data |

## Conversational

```
"Create a new project for my frontend work"
"Show me the dashboard"
"What am I working on?"
"Who's in the hive?"
"What's the status?"
```

---

## Data structure

```
.meta-hive/
├── .hive-manifest.json     # All projects + profiles
├── leader/                 # Leader profile (you)
│   └── leader/
├── profiles/               # Project profiles
│   ├── web-app/
│   ├── api-service/
│   └── mobile/
├── projects/               # Project workspaces
│   ├── web-app/
│   ├── api-service/
│   └── mobile/
├── human/                  # Your preferences
└── shared/                 # Shared knowledge
```

---

## Why?

```
Without meta-hive:
  → One agent juggling multiple projects
  → Context bleeding between projects
  → Manual prompt management

With meta-hive:
  → One profile per project
  → Isolated context
  → Conversational management
```

---

## License

MIT