#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';
import pluginManifest from '../public/manifest.json';
import colors from 'ansi-colors';
import commander, { program } from 'commander';
import { prompt } from 'enquirer';

import { generateCommand } from './commands/generate-command';

const warning = colors.yellow;
const success = colors.green;
const error = colors.red;
const bold = colors.bold;

const basePath = execSync('git rev-parse --show-toplevel', {
  encoding: 'utf-8',
}).trim();

const main = async () => {
  if (!basePath) {
    console.log('Must run inside a RemNote plugin git repository!');
    exit(1);
  }

  console.log(bold('Plugin path:'), basePath);
  console.log();

  commander.program.name('rn-toolbox').description('Management CLI for RemNote plugin development');
  commander.program
    .command('generate')
    .description('Scaffold parts of remnote plugins.')
    .addArgument(
      new commander.Argument('<component>', 'The component to generate').choices(['command'])
    )
    .action(async (component) => {
      if (component === 'command') {
        await generateCommand();
      }
    });
  commander.program.parse();
};

main();
