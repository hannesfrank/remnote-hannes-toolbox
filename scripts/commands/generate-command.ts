import { prompt } from 'enquirer';
import fs, { writeFileSync } from 'fs';
import _ from 'lodash';
const kebabToPascalCase = (str: string) =>
  _.kebabCase(str)
    .split('-')
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join('');

const makeCommand = (info: { id: string; name: string; description: string }) => `
import {
  Command,
  RNPlugin,
} from '@remnote/plugin-sdk';
import _ from 'underscore';

import { RN_PLUGIN_TEST_MODE } from '../util/plugin_util';

export const COMMAND_INFO = {
  id: '${info.id}',
  name: '${info.name}',
  description: '${info.description}',
}

// RN_PLUGIN_TEST_MODE.add(COMMAND_INFO.id);

async function ${kebabToPascalCase(info.id)}(plugin: RNPlugin) {
  // Command Action
}

export default function ${kebabToPascalCase(info.id)}Command(
  plugin: RNPlugin,
  options: { } = {}
): Command {
  return {
    ...COMMAND_INFO,
    action: async () => ${kebabToPascalCase(info.id)}(plugin),
  };
}

export async function test${kebabToPascalCase(info.id)}(plugin: RNPlugin) {
  const TEST_CASES = [
    // [input, expectedOutput]
  ];
}
`;

/**
 * Prompts the user for a command id, name, and description.
 * Generates a typescript file in `src/commands/` with a command skeleton.
 */
export const generateCommand = async () => {
  const { id, name, description } = await prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Command id (kebab-case):',
      format: (val: string) => _.kebabCase(val),
      result: (val: string) => _.kebabCase(val),
      validate: (val: string) =>
        fs.existsSync(`src/commands/${kebabToPascalCase(val)}.ts`) ? 'Already exists' : true,
    },
    {
      type: 'input',
      name: 'name',
      message: 'Name of the command (e.g. in Omnibar):',
      initial: 'Name of command',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description displayed below name:',
      initial: 'Description of command',
    },
  ])!;

  const commandSrc = makeCommand({ id, name, description });
  writeFileSync(`src/commands/${kebabToPascalCase(id)}.ts`, commandSrc);
};
