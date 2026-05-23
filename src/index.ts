#!/usr/bin/env node

import { Command } from 'commander';
import { initHive } from './commands/init.js';
import { joinHive } from './commands/join.js';
import { showStatus } from './commands/status.js';
import { showProfiles } from './commands/profiles.js';
import { leaveHive } from './commands/leave.js';
import { createProject, showProjects } from './commands/project.js';
import { showHumanProfile } from './commands/human.js';
import pc from 'picocolors';

const program = new Command();

program
  .name('meta-hive')
  .description('Multi-agent hive orchestration system for the pi coding agent')
  .version('0.1.0');

// init command
program
  .command('init')
  .description('Initialize a new hive with a leader profile')
  .option('-n, --name <name>', 'Hive folder name', '.meta-hive')
  .option('-p, --profile <name>', 'Leader profile name', 'leader')
  .action(async (options) => {
    try {
      await initHive({
        hiveName: options.name,
        profileName: options.profile,
        isLeader: true,
      });
    } catch (error) {
      console.error(pc.red('Error initializing hive:'), error);
      process.exit(1);
    }
  });

// join command
program
  .command('join <path>')
  .description('Join an existing hive')
  .option('-p, --profile <name>', 'Your profile name')
  .option('-i, --identity <text>', 'Your profile description')
  .option('-P, --projects <names...>', 'Projects to work on')
  .action(async (path, options) => {
    try {
      const profileName = options.profile || `profile-${Date.now().toString(36)}`;
      await joinHive({
        hivePath: path,
        profileName,
        identity: options.identity,
        projects: options.projects || [],
      });
    } catch (error) {
      console.error(pc.red('Error joining hive:'), error);
      process.exit(1);
    }
  });

// status command
program
  .command('status')
  .description('Show hive status')
  .action(async () => {
    try {
      await showStatus();
    } catch (error) {
      console.error(pc.red('Error getting status:'), error);
      process.exit(1);
    }
  });

// profiles command
program
  .command('profiles')
  .description('List all profiles in the hive')
  .action(async () => {
    try {
      await showProfiles();
    } catch (error) {
      console.error(pc.red('Error listing profiles:'), error);
      process.exit(1);
    }
  });

// leave command
program
  .command('leave')
  .description('Leave the current hive')
  .action(async () => {
    try {
      await leaveHive();
    } catch (error) {
      console.error(pc.red('Error leaving hive:'), error);
      process.exit(1);
    }
  });

// human command
program
  .command('human')
  .description('Show human profile info')
  .action(async () => {
    try {
      await showHumanProfile();
    } catch (error) {
      console.error(pc.red('Error showing human profile:'), error);
      process.exit(1);
    }
  });

// project subcommand
const projectCmd = program
  .command('project')
  .description('Manage projects in the hive');

// project add
projectCmd
  .command('add <name>')
  .description('Add a new project to the hive')
  .action(async (name) => {
    try {
      const config = await import('./hive/config.js').then(m => m.loadConfig());
      if (!config?.hivePath) {
        console.log(pc.red('❌ Not connected to any hive.'));
        return;
      }
      await createProject({
        hivePath: config.hivePath,
        projectName: name,
        profileName: config.profileName,
      });
    } catch (error) {
      console.error(pc.red('Error creating project:'), error);
      process.exit(1);
    }
  });

// project list
projectCmd
  .command('list')
  .description('List all projects in the hive')
  .action(async () => {
    try {
      await showProjects();
    } catch (error) {
      console.error(pc.red('Error listing projects:'), error);
      process.exit(1);
    }
  });

// Scan command - leader scans the hive
program
  .command('scan')
  .description('Scan the hive (leader only)')
  .action(async () => {
    try {
      const { scanHive } = await import('./hive/scanner.js');
      const { loadConfig } = await import('./hive/config.js');
      const config = await loadConfig();

      if (!config?.hivePath) {
        console.log(pc.red('❌ Not connected to any hive.'));
        return;
      }

      const result = await scanHive(config.hivePath);

      console.log(pc.bold(pc.blue('\n=== Hive Scan Results ===')));
      console.log();
      console.log(pc.bold('Profiles:'), result.profiles.length);
      console.log(pc.bold('Projects:'), result.projects.length);
      console.log(pc.bold('Scan Time:'), new Date(result.lastScan).toLocaleString());
      console.log();

      if (result.insights && result.insights.length > 0) {
        console.log(pc.bold('Insights:'));
        for (const insight of result.insights) {
          console.log(`  💡 ${insight}`);
        }
      }
    } catch (error) {
      console.error(pc.red('Error scanning hive:'), error);
      process.exit(1);
    }
  });

program.parse();