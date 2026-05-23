import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import path from "node:path";
import fs from "node:fs/promises";

export interface MetaHiveConfig {
  hivePath: string;
  profileName: string;
  isLeader: boolean;
  activeProject: string | null;
}

const CONFIG_FILENAME = "hive-config.json";

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

async function getProfileIdentity(profilePath: string): Promise<{ name: string; description: string } | null> {
  const identityPath = path.join(profilePath, "identity.md");
  try {
    const content = await fs.readFile(identityPath, "utf-8");
    const lines = content.split("\n");
    const name = lines[0]?.replace(/^#\s*/, "").trim() || "Unknown";
    const description = lines.slice(1, 3).join(" ").trim() || "";
    return { name, description };
  } catch {
    return null;
  }
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
      ctx.ui.notify(`Meta-Hive: ${config.profileName}@${config.isLeader ? "leader" : "profile"}`, "info");
    }
  });

  // Inject hive context into agent
  pi.on("before_agent_start", async (_event, _ctx) => {
    if (!config || !currentHivePath) return;

    const manifest = await getHiveManifest(currentHivePath);
    if (!manifest) return;

    let hiveContext = `\n\n## Meta-Hive Context\n`;
    hiveContext += `Hive: ${currentHivePath}\n`;
    hiveContext += `Profile: ${config.profileName}\n`;
    hiveContext += `Role: ${config.isLeader ? "Leader (orchestrator)" : "Profile (worker)"}\n`;

    if (config.isLeader) {
      // Leader gets full hive overview
      hiveContext += `\n### Hive Overview\n`;
      hiveContext += `Leader: ${manifest.leader}\n`;
      hiveContext += `Profiles: ${manifest.profiles.join(", ")}\n`;
      hiveContext += `Active Project: ${config.activeProject || "None"}\n`;

      // Get profile identities for leader context
      for (const profileName of manifest.profiles) {
        const profilePath = path.join(currentHivePath, profileName === manifest.leader ? "leader" : "profiles", profileName);
        const identity = await getProfileIdentity(profilePath);
        if (identity) {
          hiveContext += `\n### Profile: ${identity.name}\n${identity.description}\n`;
        }
      }
    } else {
      // Regular profiles get limited context
      const profilePath = path.join(currentHivePath, "profiles", config.profileName);
      const identity = await getProfileIdentity(profilePath);
      if (identity) {
        hiveContext += `\n### Your Profile\n${identity.name}\n${identity.description}\n`;
      }
      if (config.activeProject) {
        hiveContext += `\nWorking on: ${config.activeProject}\n`;
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

  // Register Meta-Hive tools
  pi.registerTool({
    name: "meta_hive_status",
    label: "Hive Status",
    description: "Get the current status of the Meta-Hive hive this profile belongs to",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      const notConnected = {
        content: [{ type: "text" as const, text: "Not connected to any hive. Run `meta-hive init` or `meta-hive join` first." }],
        details: {},
      };

      const noManifest = {
        content: [{ type: "text" as const, text: "Hive manifest not found." }],
        details: {},
      };

      if (!config || !currentHivePath) {
        return notConnected;
      }

      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        return noManifest;
      }

      let status = `## Meta-Hive Status\n\n`;
      status += `**Hive Path:** ${currentHivePath}\n`;
      status += `**Your Profile:** ${config.profileName}\n`;
      status += `**Role:** ${config.isLeader ? "Leader" : "Profile"}\n`;
      status += `**Active Project:** ${config.activeProject || "None"}\n\n`;

      status += `### Hive Manifest\n`;
      status += `- **Leader:** ${manifest.leader}\n`;
      status += `- **Profiles:** ${manifest.profiles.length}\n`;
      status += `- **Version:** ${manifest.version}\n`;

      if (config.isLeader) {
        status += `\n### All Profiles\n`;
        for (const profileName of manifest.profiles) {
          const profilePath = path.join(
            currentHivePath,
            profileName === manifest.leader ? "leader" : "profiles",
            profileName
          );
          const identity = await getProfileIdentity(profilePath);
          const badge = profileName === manifest.leader ? " 👑" : "";
          status += `- **${profileName}**${badge}`;
          if (identity?.description) {
            status += `\n  ${identity.description}`;
          }
          status += "\n";
        }
      }

      return {
        content: [{ type: "text" as const, text: status }],
        details: { hivePath: currentHivePath, manifest },
      };
    },
  });

  pi.registerTool({
    name: "meta_hive_scan",
    label: "Hive Scan",
    description: "Scan the hive for insights (Leader only). Generates a summary of all profiles and their activities.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      const notConnected = {
        content: [{ type: "text" as const, text: "Not connected to any hive." }],
        details: {},
      };

      const leaderOnly = {
        content: [{ type: "text" as const, text: "Only the Leader can scan the hive." }],
        details: {},
      };

      const noManifest = {
        content: [{ type: "text" as const, text: "Hive manifest not found." }],
        details: {},
      };

      if (!config || !currentHivePath) {
        return notConnected;
      }

      if (!config.isLeader) {
        return leaderOnly;
      }

      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        return noManifest;
      }

      let scan = `## Hive Scan Results\n\n`;
      scan += `**Scanned at:** ${new Date().toISOString()}\n`;
      scan += `**Profiles found:** ${manifest.profiles.length}\n\n`;

      const insights: string[] = [];
      insights.push(`${manifest.profiles.length} profile(s) in the hive`);

      if (manifest.leader) {
        insights.push(`Leader "${manifest.leader}" is active`);
      }

      scan += `### Insights\n`;
      for (const insight of insights) {
        scan += `- ${insight}\n`;
      }

      scan += `\n### Profile Details\n`;
      for (const profileName of manifest.profiles) {
        const profilePath = path.join(
          currentHivePath,
          profileName === manifest.leader ? "leader" : "profiles",
          profileName
        );
        const identity = await getProfileIdentity(profilePath);

        scan += `\n#### ${profileName}${profileName === manifest.leader ? " (Leader)" : ""}\n`;
        if (identity?.description) {
          scan += `${identity.description}\n`;
        }

        // Check for projects
        const projectsPath = path.join(profilePath, "projects.json");
        try {
          const projectsContent = await fs.readFile(projectsPath, "utf-8");
          const projects = JSON.parse(projectsContent);
          if (Array.isArray(projects) && projects.length > 0) {
            scan += `Projects: ${projects.join(", ")}\n`;
          }
        } catch {
          // No projects file
        }
      }

      return {
        content: [{ type: "text" as const, text: scan }],
        details: { timestamp: new Date().toISOString(), profiles: manifest.profiles, insights },
      };
    },
  });

  pi.registerTool({
    name: "meta_hive_set_project",
    label: "Set Active Project",
    description: "Set the active project for this profile in the hive",
    parameters: Type.Object({
      project: Type.String({ description: "Project name to set as active" }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const notConnected = {
        content: [{ type: "text" as const, text: "Not connected to any hive." }],
        details: {},
      };

      if (!config || !currentHivePath) {
        return notConnected;
      }

      config.activeProject = params.project;

      // Update config file
      const configPath = path.join(ctx.cwd, CONFIG_FILENAME);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));

      return {
        content: [{ type: "text" as const, text: `Active project set to: ${params.project}` }],
        details: { activeProject: params.project },
      };
    },
  });

  pi.registerTool({
    name: "meta_hive_list_profiles",
    label: "List Profiles",
    description: "List all profiles in the hive with their details",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      const notConnected = {
        content: [{ type: "text" as const, text: "Not connected to any hive." }],
        details: {},
      };

      const noManifest = {
        content: [{ type: "text" as const, text: "Hive manifest not found." }],
        details: {},
      };

      if (!config || !currentHivePath) {
        return notConnected;
      }

      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        return noManifest;
      }

      let output = `## Hive Profiles\n\n`;
      output += `**Total:** ${manifest.profiles.length}\n`;
      output += `**Leader:** ${manifest.leader}\n\n`;

      for (const profileName of manifest.profiles) {
        const profilePath = path.join(
          currentHivePath,
          profileName === manifest.leader ? "leader" : "profiles",
          profileName
        );
        const identity = await getProfileIdentity(profilePath);

        const badges: string[] = [];
        if (profileName === manifest.leader) badges.push("👑 Leader");
        if (profileName === config.profileName) badges.push("(you)");

        output += `### ${profileName} ${badges.join(" ")}\n`;
        if (identity?.description) {
          output += `${identity.description}\n`;
        }

        // Get projects
        const projectsPath = path.join(profilePath, "projects.json");
        try {
          const projectsContent = await fs.readFile(projectsPath, "utf-8");
          const projects = JSON.parse(projectsContent);
          if (Array.isArray(projects) && projects.length > 0) {
            output += `**Projects:** ${projects.join(", ")}\n`;
          }
        } catch {
          // No projects
        }
        output += "\n";
      }

      return {
        content: [{ type: "text" as const, text: output }],
        details: { profiles: manifest.profiles, leader: manifest.leader },
      };
    },
  });

  // Register Meta-Hive commands
  pi.registerCommand("hive-status", {
    description: "Show Meta-Hive status",
    handler: async (_args, ctx) => {
      if (!config || !currentHivePath) {
        ctx.ui.notify("Not connected to any hive", "error");
        return;
      }
      const manifest = await getHiveManifest(currentHivePath);
      if (!manifest) {
        ctx.ui.notify("Hive manifest not found", "error");
        return;
      }
      ctx.ui.notify(
        `${config.profileName}@${config.isLeader ? "leader" : "profile"} | ${manifest.profiles.length} profiles`,
        "info"
      );
    },
  });

  pi.registerCommand("hive-scan", {
    description: "Scan the hive (Leader only)",
    handler: async (_args, ctx) => {
      if (!config?.isLeader) {
        ctx.ui.notify("Only the Leader can scan the hive", "error");
        return;
      }
      ctx.ui.notify("Scanning hive...", "info");
      ctx.ui.notify("Scan complete - use meta_hive_scan tool for details", "info");
    },
  });
}