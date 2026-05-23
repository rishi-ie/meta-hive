import pc from 'picocolors';
import { loadManifest } from '../hive/manifest.js';
import { getAllProfiles } from '../profile/creator.js';
import { scanHive } from '../hive/scanner.js';
import { loadConfig } from '../hive/config.js';

export async function showStatus(): Promise<void> {
  const config = await loadConfig();

  if (!config?.hivePath) {
    console.log(pc.red('❌ Not connected to any hive.'));
    console.log(pc.gray('  Run `meta-hive init` or `meta-hive join <path>` to connect.'));
    return;
  }

  const hivePath = config.hivePath;

  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    console.log(pc.red(`❌ No hive found at ${hivePath}`));
    console.log(pc.gray('  The hive may have been deleted or moved.'));
    return;
  }

  const profiles = await getAllProfiles(hivePath);
  const scanResult = await scanHive(hivePath);

  console.log(pc.bold(pc.blue('\n=== Meta-Hive Status ===')));
  console.log();
  console.log(pc.bold('Hive:'), hivePath);
  console.log(pc.bold('Version:'), manifest.version);
  console.log(pc.bold('Created:'), new Date(manifest.createdAt).toLocaleString());
  console.log();

  // Leader
  console.log(pc.bold('Leader:'), pc.cyan(manifest.leader));
  if (config.profileName === manifest.leader) {
    console.log(pc.gray('  ← You are the leader'));
  }
  console.log();

  // Current profile
  console.log(pc.bold('Current Profile:'), pc.cyan(config.profileName));
  console.log(pc.bold('Active Project:'), config.activeProject || pc.gray('None'));
  console.log();

  // Profiles
  console.log(pc.bold(`Profiles (${manifest.profiles.length}):`));
  for (const profileName of manifest.profiles) {
    const profile = profiles.find(p => p.name === profileName);
    const isLeader = profileName === manifest.leader;
    const isCurrent = profileName === config.profileName;

    let line = `  ${isLeader ? '👑' : '🤖'} ${pc.cyan(profileName)}`;
    if (isCurrent) line += pc.gray(' (you)');
    if (isLeader) line += pc.gray(' (leader)');

    console.log(line);

    if (profile && profile.projects.length > 0) {
      console.log(pc.gray(`     Projects: ${profile.projects.join(', ')}`));
    }
  }
  console.log();

  // Projects
  if (scanResult.projects.length > 0) {
    console.log(pc.bold(`Projects (${scanResult.projects.length}):`));
    for (const project of scanResult.projects) {
      console.log(`  📁 ${project}`);
    }
    console.log();
  }

  // Insights
  if (scanResult.insights && scanResult.insights.length > 0) {
    console.log(pc.bold('Insights:'));
    for (const insight of scanResult.insights) {
      console.log(`  💡 ${insight}`);
    }
    console.log();
  }

  // Last scan
  console.log(pc.gray(`Last scan: ${new Date(scanResult.lastScan).toLocaleString()}`));
}