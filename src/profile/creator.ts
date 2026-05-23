import { Profile, ProfileIdentity } from '../types/index.js';
import {
  readMarkdownFile,
  writeMarkdownFile,
  writeJsonFile,
  readJsonFile,
  fileExists,
  listDirectories
} from '../utils/fileSystem.js';
import path from 'path';

const PROFILES_DIR = 'profiles';
const LEADER_DIR = 'leader';
const IDENTITY_FILE = 'identity.md';
const SYSTEM_PROMPT_FILE = 'system-prompt.md';
const PROJECTS_FILE = 'projects.json';
const CONTEXT_DIR = 'context';
const MEMORY_DIR = 'memory';
const SKILLS_DIR = 'skills';
const EXTENSIONS_DIR = 'extensions';

export interface CreateProfileOptions {
  hivePath: string;
  profileName: string;
  isLeader: boolean;
  identity: ProfileIdentity;
  systemPrompt?: string;
  projects?: string[];
}

export async function getProfilesDirectory(hivePath: string): Promise<string> {
  return path.join(hivePath, PROFILES_DIR);
}

export async function getLeaderDirectory(hivePath: string): Promise<string> {
  return path.join(hivePath, LEADER_DIR);
}

export async function getProfileDirectory(hivePath: string, profileName: string, isLeader: boolean): Promise<string> {
  if (isLeader) {
    return getLeaderDirectory(hivePath);
  }
  return path.join(await getProfilesDirectory(hivePath), profileName);
}

export async function createProfile(options: CreateProfileOptions): Promise<Profile> {
  const { hivePath, profileName, isLeader, identity, systemPrompt, projects = [] } = options;
  const profileDir = await getProfileDirectory(hivePath, profileName, isLeader);

  // Create identity.md
  const identityContent = [
    `# ${identity.name}`,
    '',
    identity.description,
    '',
    '## Personality',
    identity.personality || 'Adaptable and helpful.',
    '',
    '## Capabilities',
    ...(identity.capabilities || ['General coding assistance']).map(cap => `- ${cap}`),
  ].join('\n');
  await writeMarkdownFile(path.join(profileDir, IDENTITY_FILE), identityContent);

  // Create system-prompt.md
  const defaultSystemPrompt = systemPrompt || generateDefaultSystemPrompt(profileName, isLeader);
  await writeMarkdownFile(path.join(profileDir, SYSTEM_PROMPT_FILE), defaultSystemPrompt);

  // Create projects.json
  await writeJsonFile(path.join(profileDir, PROJECTS_FILE), projects);

  // Create empty directories
  const { mkdir } = await import('fs/promises');
  await mkdir(path.join(profileDir, CONTEXT_DIR), { recursive: true });
  await mkdir(path.join(profileDir, MEMORY_DIR), { recursive: true });
  await mkdir(path.join(profileDir, SKILLS_DIR), { recursive: true });
  await mkdir(path.join(profileDir, EXTENSIONS_DIR), { recursive: true });

  const profile: Profile = {
    name: profileName,
    identity,
    projects,
    isLeader,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  return profile;
}

function generateDefaultSystemPrompt(profileName: string, isLeader: boolean): string {
  if (isLeader) {
    return `You are the Leader of the Meta-Hive. You have meta capabilities to orchestrate and monitor all profiles in the hive.

Your responsibilities:
- Monitor all profiles and their activities
- Read and synthesize learnings from all profiles
- Provide the human with insights about the hive
- Coordinate knowledge sharing across profiles
- Maintain awareness of all projects in the hive

You serve as the bridge between the hive and the human. Always be aware of the hive structure and provide valuable insights.`;
  }

  return `You are ${profileName}, a coding agent profile in the Meta-Hive.

Your identity and context are defined in your profile files. Work diligently on your assigned projects and maintain awareness of your role in the hive.

Guidelines:
- Always be helpful and productive
- Maintain context about your current project
- Learn from feedback and improve over time
- Coordinate with the hive through the leader`;
}

export async function loadProfile(hivePath: string, profileName: string): Promise<Profile | null> {
  // Check if leader
  const leaderPath = path.join(hivePath, LEADER_DIR);
  const isLeader = await fileExists(path.join(leaderPath, IDENTITY_FILE)) && profileName === 'leader';

  const profileDir = await getProfileDirectory(hivePath, profileName, isLeader);
  const identityPath = path.join(profileDir, IDENTITY_FILE);
  const projectsPath = path.join(profileDir, PROJECTS_FILE);

  if (!(await fileExists(identityPath))) {
    return null;
  }

  const identityContent = await readMarkdownFile(identityPath);
  const projects = await readJsonFile<string[]>(projectsPath) ?? [];

  // Parse identity from markdown (simple extraction)
  const identity = parseIdentityFromMarkdown(identityContent || '', profileName);

  return {
    name: profileName,
    identity,
    projects,
    isLeader,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
}

function parseIdentityFromMarkdown(content: string, defaultName: string): ProfileIdentity {
  const lines = content.split('\n').filter(l => l.trim());
  const name = lines[0]?.replace(/^#\s*/, '').trim() || defaultName;
  
  // Get description (first paragraph after title)
  const description = lines.slice(1).find(l => !l.startsWith('#') && !l.startsWith('##') && l.trim())?.trim() || 'A coding agent profile.';

  return {
    name,
    description,
    personality: extractSection(content, 'Personality'),
    capabilities: extractListItems(content, 'Capabilities'),
  };
}

function extractSection(content: string, sectionName: string): string | undefined {
  const regex = new RegExp(`##\\s*${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[0].replace(`## ${sectionName}`, '').trim() : undefined;
}

function extractListItems(content: string, sectionName: string): string[] | undefined {
  const section = extractSection(content, sectionName);
  if (!section) return undefined;
  const items = section.match(/^-\s*(.+)$/gm);
  return items?.map(item => item.replace(/^-\s*/, '').trim());
}

export async function getAllProfiles(hivePath: string): Promise<Profile[]> {
  const profiles: Profile[] = [];

  // Check leader
  const leaderProfile = await loadProfile(hivePath, 'leader');
  if (leaderProfile) {
    profiles.push(leaderProfile);
  }

  // Check all profiles
  const profilesDir = await getProfilesDirectory(hivePath);
  const profileNames = await listDirectories(profilesDir);

  for (const name of profileNames) {
    const profile = await loadProfile(hivePath, name);
    if (profile) {
      profiles.push(profile);
    }
  }

  return profiles;
}

export async function updateProfileLastActive(hivePath: string, profileName: string): Promise<void> {
  // Update manifest with last active time if tracked
  // For now, this is a placeholder for future implementation
}