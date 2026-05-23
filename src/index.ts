#!/usr/bin/env node

import { Command } from 'commander';
import { initHive } from './commands/init.js';
import { joinHive } from './commands/join.js';
import { showStatus } from './commands/status.js';
import { showProfiles } from './commands/profiles.js';
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

program.parse();