import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import path from "node:path";
import fs from "node:fs/promises";
import { execa } from "execa";

export interface MetaHiveConfig {
  hivePath: string;
  profileName: string;
  isLeader: boolean;
  activeProject: string | null;
}

export interface ProfileInfo {
  name: string;
  description: string;
  projects: string[];
  isLeader: boolean;
  isCurrent: boolean;
}

const CONFIG_FILENAME = "hive-config.json";

// Helper to run meta-hive CLI
async function runMetaHive(args: string[], cwd: string): Promise<string> {
  try {
    const result = await execa("node", [
      path.join("/Users/rishi/work/projects/meta-hive/dist/index.js"),
      ...args
    ], { cwd, extendEnv: true, env: { ...process.env } });
    return result.stdout;
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    return err.stderr || err.message || "Command failed";
  }
}

async function getConfig(cwd: string): Promise<MetaHiveConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  try {
    const content = await fs.readFile(configPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function getHiveManifest(hivePath: string): Promise<{ leader: string; profiles: string[]; version: string } | null> {
  const manifestPath = path.join(hivePath, ".hive-manifest.json");
  try {
    const content = await fs.readFile(manifestPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function getProfileInfo(profilePath: string, profileName: string, isLeader: boolean, currentProfile: string): Promise<ProfileInfo | null> {
  const identityPath = path.join(profilePath, "identity.md");
  const projectsPath = path.join(profilePath, "projects.json");

  let description = "";
  let projects: string[] = [];

  try {
    const identityContent = await fs.readFile(identityPath, "utf-8");
    const lines = identityContent.split("\n");
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith("#") && !line.startsWith("##")) {
        description = line;
        break;
      }
    }
  } catch {
    description = "Profile in hive";
  }

  try {
    const projectsContent = await fs.readFile(projectsPath, "utf-8");
    projects = JSON.parse(projectsContent);
    if (!Array.isArray(projects)) projects = [];
  } catch {
    projects = [];
  }

  return {
    name: profileName,
    description,
    projects,
    isLeader,
    isCurrent: profileName === currentProfile,
  };
}

export default async function (pi: ExtensionAPI) {
  let config: MetaHiveConfig | null = null;
  let currentHivePath: string | null = null;

  // Load config on session start
  pi.on("session_start", async (_event, ctx) => {
    config = await getConfig(ctx.cwd);
    if (config?.hivePath) {
      currentHivePath = path.isAbsolute(config.hivePath)
        ? config.hivePath
        : path.join(ctx.cwd, config.hivePath);
    }

    if (config && currentHivePath) {
      const manifest = await getHiveManifest(currentHivePath);

      let welcomeMsg = `🐝 Meta-Hive\n`;
      welcomeMsg += `━━━━━━━━━━━━━━━\n`;
      welcomeMsg += `Profile: ${config.profileName}\n`;
      welcomeMsg += `Role: ${config.isLeader ? "👑 Leader" : "🤖 Profile"}\n`;
      welcomeMsg += `Hive: ${currentHivePath}\n`;

      if (config.activeProject) {
        welcomeMsg += `Project: ${config.activeProject}\n`;
      }

      if (manifest) {
        welcomeMsg += `Profiles in hive: ${manifest.profiles.length}\n`;
      }

      welcomeMsg += `\nCommands: /meta-hive, /profile, /hive`;

      ctx.ui.notify(welcomeMsg, "info");
    }
  });

  // Inject hive context into agent
  pi.on("before_agent_start", async (_event, _ctx) => {
    if (!config || !currentHivePath) return;

    const manifest = await getHiveManifest(currentHivePath);
    if (!manifest) return;

    let hiveContext = `\n## Meta-Hive Context\n`;
    hiveContext += `**Hive:** ${currentHivePath}\n`;
    hiveContext += `**Your Profile:** ${config.profileName}\n`;
    hiveContext += `**Role:** ${config.isLeader ? "Leader (orchestrator)" : "Profile (worker)"}\n`;
    hiveContext += `**Active Project:** ${config.activeProject || "None"}\n`;

    if (config.isLeader) {
      hiveContext += `\n### Hive Members\n`;
      for (const profileName of manifest.profiles) {
        const profilePath = path.join(currentHivePath, profileName === manifest.leader ? "leader" : "profiles", profileName);
        const info = await getProfileInfo(profilePath, profileName, profileName === manifest.leader, config.profileName);
        if (info) {
          const badge = profileName === manifest.leader ? " 👑" : "";
          hiveContext += `- **${profileName}**${badge}`;
          if (info.projects.length > 0) {
            hiveContext += ` (${info.projects.join(", ")})`;
          }
          hiveContext += `\n`;
        }
      }
    }

    return {
      message: {
        customType: "meta-hive",
        content: hiveContext,
        display: false,
      },
    };
  });

  // Register /meta-hive command with subcommands
  pi.registerCommand("meta-hive", {
    description: "Meta-Hive commands: init, join, status, profiles, project, scan, leave",
    async handler(args, ctx) {
      const parts = args.trim().split(/\s+/);
      const subcommand = parts[0] || "";
      const subArgs = parts.slice(1).join(" ");

      // No subcommand - show help
      if (!subcommand) {
        ctx.ui.notify("Meta-Hive Commands:\n/meta-hive init\n/meta-hive join\n/meta-hive status\n/meta-hive profiles\n/meta-hive project add\n/meta-hive scan\n/meta-hive leave", "info");
        return;
      }

      switch (subcommand) {
        case "init": {
          ctx.ui.notify("Creating new hive...", "info");
          const output = await runMetaHive(["init", "--name", ".meta-hive", "--profile", "leader"], ctx.cwd);
          ctx.ui.notify(output.includes("✅") ? "Hive created!" : output, "info");
          break;
        }
        case "join": {
          if (!subArgs) {
            ctx.ui.notify("Usage: /meta-hive join <profile-name> [projects...]", "info");
            return;
          }
          const joinParts = subArgs.split(/\s+/);
          const profileName = joinParts[0];
          const projects = joinParts.slice(1);

          // Find hive path
          let hivePath = currentHivePath || "";
          if (!hivePath) {
            // Try to find .meta-hive in parent directories
            let checkPath = ctx.cwd;
            for (let i = 0; i < 5; i++) {
              const parentPath = path.dirname(checkPath);
              if (parentPath === checkPath) break;
              const potentialHive = path.join(parentPath, ".meta-hive");
              try {
                await fs.access(potentialHive);
                hivePath = potentialHive;
                break;
              } catch {}
              checkPath = parentPath;
            }
          }

          if (!hivePath) {
            ctx.ui.notify("No hive found. Run /meta-hive init first.", "error");
            return;
          }

          ctx.ui.notify(`Creating profile "${profileName}"...`, "info");
          const args = ["join", hivePath, "--profile", profileName];
          if (projects.length > 0) {
            args.push("--projects", ...projects);
          }
          const output = await runMetaHive(args, ctx.cwd);
          ctx.ui.notify(output.includes("✅") ? `Profile "${profileName}" created!` : output, "info");
          break;
        }
        case "status": {
          const output = await runMetaHive(["status"], ctx.cwd);
          ctx.ui.notify(output.substring(0, 200), "info");
          break;
        }
        case "profiles": {
          const output = await runMetaHive(["profiles"], ctx.cwd);
          ctx.ui.notify(output.substring(0, 200), "info");
          break;
        }
        case "scan": {
          if (!config?.isLeader) {
            ctx.ui.notify("Only the Leader can scan.", "error");
            return;
          }
          const output = await runMetaHive(["scan"], ctx.cwd);
          ctx.ui.notify(output.includes("✅") ? "Scan complete!" : output, "info");
          break;
        }
        case "project": {
          const projectArgs = subArgs.split(/\s+/);
          const projectCmd = projectArgs[0] || "";
          const projectName = projectArgs.slice(1).join(" ");

          if (projectCmd === "add" && projectName) {
            const output = await runMetaHive(["project", "add", projectName], ctx.cwd);
            ctx.ui.notify(output.includes("✅") ? `Project "${projectName}" created!` : output, "info");
          } else if (projectCmd === "list") {
            const output = await runMetaHive(["project", "list"], ctx.cwd);
            ctx.ui.notify(output.substring(0, 200), "info");
          } else {
            ctx.ui.notify("Usage: /meta-hive project add <name>\n       /meta-hive project list", "info");
          }
          break;
        }
        case "leave": {
          if (config?.isLeader) {
            ctx.ui.notify("Leaders cannot leave. Delete the hive folder instead.", "error");
            return;
          }
          const output = await runMetaHive(["leave"], ctx.cwd);
          ctx.ui.notify(output.includes("✅") ? "Left the hive!" : output, "info");
          break;
        }
        default:
          ctx.ui.notify(`Unknown command: ${subcommand}\n\nCommands: init, join, status, profiles, project, scan, leave`, "error");
      }
    },
  });

  // Register /profile command
  pi.registerCommand("profile", {
    description: "Show and switch between hive profiles",
    async handler(_args, ctx) {
      if (!config || !currentHivePath) {
        ctx.ui.notify("Not connected to any hive. Run /meta-hive init first.", "error");
        return;
      }

      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        ctx.ui.notify("Hive manifest not found", "error");
        return;
      }

      const profileList: string[] = [];
      const profileInfos: ProfileInfo[] = [];

      for (const profileName of manifest.profiles) {
        const profilePath = path.join(
          currentHivePath,
          profileName === manifest.leader ? "leader" : "profiles",
          profileName
        );
        const info = await getProfileInfo(
          profilePath,
          profileName,
          profileName === manifest.leader,
          config.profileName
        );
        if (info) {
          profileInfos.push(info);
          const badge = info.isLeader ? " 👑" : "";
          const current = info.isCurrent ? " (you)" : "";
          const projects = info.projects.length > 0 ? ` - ${info.projects.slice(0, 2).join(", ")}` : "";
          profileList.push(`${info.name}${badge}${current}${projects}`);
        }
      }

      const choice = await ctx.ui.select(
        `🐝 Hive Profiles (${manifest.profiles.length})`,
        profileList
      );

      if (choice) {
        const selectedName = choice.split(" 👑")[0].split(" (you)")[0].trim();
        const selectedInfo = profileInfos.find(p => p.name === selectedName);

        if (selectedInfo) {
          let detailMsg = `━━━━━━━━━━━━━━━\n`;
          detailMsg += `Profile: ${selectedInfo.name}\n`;
          detailMsg += `Role: ${selectedInfo.isLeader ? "👑 Leader" : "🤖 Profile"}\n`;
          detailMsg += `Description: ${selectedInfo.description}\n`;
          if (selectedInfo.projects.length > 0) {
            detailMsg += `Projects: ${selectedInfo.projects.join(", ")}\n`;
          }

          ctx.ui.notify(detailMsg, "info");

          if (!selectedInfo.isCurrent) {
            ctx.ui.notify(`To switch: cd to that profile's directory and restart pi`, "info");
          }
        }
      }
    },
  });

  // Quick /hive command
  pi.registerCommand("hive", {
    description: "Quick hive status",
    handler: async (_args, ctx) => {
      if (!config || !currentHivePath) {
        ctx.ui.notify("Not connected to hive", "error");
        return;
      }
      const manifest = await getHiveManifest(currentHivePath);
      ctx.ui.notify(
        `${config.profileName}@${config.isLeader ? "👑" : "🤖"} | ${manifest?.profiles.length || 0} profiles | ${config.activeProject || "no project"}`,
        "info"
      );
    },
  });

  // Meta-Hive Tools
  pi.registerTool({
    name: "meta_hive_status",
    label: "Hive Status",
    description: "Get detailed status of the current hive, profile, and project",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (!config || !currentHivePath) {
        return {
          content: [{ type: "text" as const, text: "Not connected to any hive.\n\nUse /meta-hive init to create one, or /meta-hive join to connect." }],
          details: {},
        };
      }

      const manifest = await getHiveManifest(currentHivePath);

      let status = `# Meta-Hive Status\n\n`;
      status += `## Connection\n`;
      status += `- **Hive Path:** \`${currentHivePath}\`\n`;
      status += `- **Your Profile:** ${config.profileName}\n`;
      status += `- **Role:** ${config.isLeader ? "👑 Leader" : "🤖 Profile"}\n`;
      status += `- **Active Project:** ${config.activeProject || "None"}\n`;

      if (manifest) {
        status += `\n## Hive Info\n`;
        status += `- **Leader:** ${manifest.leader}\n`;
        status += `- **Total Profiles:** ${manifest.profiles.length}\n`;

        status += `\n## All Profiles\n`;
        for (const profileName of manifest.profiles) {
          const profilePath = path.join(
            currentHivePath,
            profileName === manifest.leader ? "leader" : "profiles",
            profileName
          );
          const info = await getProfileInfo(profilePath, profileName, profileName === manifest.leader, config.profileName);
          const badge = info?.isLeader ? " 👑" : "";
          const current = info?.isCurrent ? " ← you" : "";
          status += `- **${profileName}**${badge}${current}\n`;
        }
      }

      return {
        content: [{ type: "text" as const, text: status }],
        details: { hivePath: currentHivePath, manifest, config },
      };
    },
  });

  pi.registerTool({
    name: "meta_hive_scan",
    label: "Hive Scan",
    description: "Scan the hive for insights (Leader only)",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (!config || !currentHivePath) {
        return { content: [{ type: "text" as const, text: "Not connected to any hive." }], details: {} };
      }
      if (!config.isLeader) {
        return { content: [{ type: "text" as const, text: "Only the Leader can scan the hive." }], details: {} };
      }

      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        return { content: [{ type: "text" as const, text: "Hive manifest not found." }], details: {} };
      }

      let scan = `# Hive Scan\n\n`;
      scan += `**Profiles:** ${manifest.profiles.length}\n\n`;

      for (const profileName of manifest.profiles) {
        const profilePath = path.join(currentHivePath, profileName === manifest.leader ? "leader" : "profiles", profileName);
        const info = await getProfileInfo(profilePath, profileName, profileName === manifest.leader, config.profileName);
        scan += `### ${profileName}${profileName === manifest.leader ? " 👑" : ""}\n`;
        scan += `${info?.description || ""}\n`;
        if (info?.projects.length) {
          scan += `\nProjects: ${info.projects.join(", ")}\n`;
        }
        scan += `\n`;
      }

      return {
        content: [{ type: "text" as const, text: scan }],
        details: { profiles: manifest.profiles },
      };
    },
  });

  pi.registerTool({
    name: "meta_hive_set_project",
    label: "Set Active Project",
    description: "Set the active project for this profile",
    parameters: Type.Object({
      project: Type.String({ description: "Project name to set as active" }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (!config || !currentHivePath) {
        return { content: [{ type: "text" as const, text: "Not connected to any hive." }], details: {} };
      }

      const projectPath = path.join(currentHivePath, "projects", params.project);
      try {
        await fs.access(projectPath);
      } catch {
        return { content: [{ type: "text" as const, text: `Project "${params.project}" not found.` }], details: {} };
      }

      config.activeProject = params.project;
      await fs.writeFile(path.join(ctx.cwd, CONFIG_FILENAME), JSON.stringify(config, null, 2));

      return {
        content: [{ type: "text" as const, text: `Active project set to: ${params.project}` }],
        details: { activeProject: params.project },
      };
    },
  });

  pi.registerTool({
    name: "meta_hive_list_profiles",
    label: "List Hive Profiles",
    description: "List all profiles in the hive",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (!config || !currentHivePath) {
        return { content: [{ type: "text" as const, text: "Not connected to any hive." }], details: {} };
      }

      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        return { content: [{ type: "text" as const, text: "Hive manifest not found." }], details: {} };
      }

      let output = `# Hive Profiles\n\n`;
      output += `**Total:** ${manifest.profiles.length} | **Leader:** ${manifest.leader}\n\n`;

      for (const profileName of manifest.profiles) {
        const profilePath = path.join(currentHivePath, profileName === manifest.leader ? "leader" : "profiles", profileName);
        const info = await getProfileInfo(profilePath, profileName, profileName === manifest.leader, config.profileName);
        const badge = info?.isLeader ? "👑 " : "";
        const current = info?.isCurrent ? " (you)" : "";
        output += `### ${badge}${profileName}${current}\n`;
        output += `${info?.description || ""}\n`;
        if (info?.projects.length) {
          output += `\nProjects: ${info.projects.join(", ")}\n`;
        }
        output += `\n`;
      }

      return {
        content: [{ type: "text" as const, text: output }],
        details: { profiles: manifest.profiles, leader: manifest.leader },
      };
    },
  });
}