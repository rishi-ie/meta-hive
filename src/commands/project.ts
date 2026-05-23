import pc from 'picocolors';
import { fileExists, mkdir, writeJsonFile, listDirectories } from '../utils/fileSystem.js';
import { loadConfig } from '../hive/config.js';
import path from 'path';

export interface ProjectOptions {
  hivePath: string;
  projectName: string;
  profileName?: string;
}

export async function createProject(options: ProjectOptions): Promise<void> {
  const { hivePath, projectName } = options;

  const projectsDir = path.join(hivePath, 'projects', projectName);

  if (await fileExists(projectsDir)) {
    console.log(pc.yellow(`⚠ Project "${projectName}" already exists.`));
    return;
  }

  // Create project directory
  await mkdir(path.join(projectsDir, 'context'), { recursive: true });
  await mkdir(path.join(projectsDir, 'memory'), { recursive: true });

  // Create project metadata
  const metadata = {
    name: projectName,
    createdAt: new Date().toISOString(),
    createdBy: options.profileName || 'unknown',
  };
  await writeJsonFile(path.join(projectsDir, 'project.json'), metadata);

  console.log(pc.green(`✅ Project "${projectName}" created successfully!`));
  console.log(`  Location: ${projectsDir}`);
}

export async function listProjects(hivePath: string): Promise<string[]> {
  const projectsDir = path.join(hivePath, 'projects');
  return listDirectories(projectsDir);
}

export async function showProjects(): Promise<void> {
  const config = await loadConfig();

  if (!config?.hivePath) {
    console.log(pc.red('❌ Not connected to any hive.'));
    return;
  }

  const projects = await listProjects(config.hivePath);

  console.log(pc.bold(pc.blue('\n=== Projects ===')));
  console.log();

  if (projects.length === 0) {
    console.log(pc.gray('No projects yet. Create one with: meta-hive project add <name>'));
    return;
  }

  for (const project of projects) {
    console.log(`  📁 ${pc.cyan(project)}`);

    // List profiles working on this project
    const profilesDir = path.join(config.hivePath, 'projects', project);
    const profiles = await listDirectories(profilesDir);

    if (profiles.length > 0) {
      console.log(pc.gray(`     Profiles: ${profiles.join(', ')}`));
    }
  }
}