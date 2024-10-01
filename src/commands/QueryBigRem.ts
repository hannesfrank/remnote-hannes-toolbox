import { Command, Query, RNPlugin } from '@remnote/plugin-sdk';
import _ from 'underscore';

import { RN_PLUGIN_TEST_MODE } from '../util/plugin_util';
import { pluginLog } from '../util/dev_util';

export const COMMAND_INFO = {
  id: 'query-big-rem',
  name: 'Query Big Rem',
  description: 'Query the largest rem in your KB and log them to the console.',
};

// RN_PLUGIN_TEST_MODE.add(COMMAND_INFO.id);

async function QueryBigRem(plugin: RNPlugin) {
  pluginLog('Fetching all rem...');
  const allRem = await plugin.rem.getAll();
  pluginLog('Fetched ' + allRem.length + ' rem.');
  const remMap = new Map(allRem.map((rem) => [rem._id, rem]));
  const bigRem = allRem.filter((rem) => rem.children && rem.children.length > 30);

  bigRem.sort((a, b) => b.children!.length - a.children!.length);

  for (const rem of bigRem) {
    const ancestorStack: string[] = [];
    let remId: string | null = rem._id;
    while (remId) {
      const parentRem = remMap.get(remId);
      if (!parentRem) break;

      const parentText = await plugin.richText.toString(parentRem.text || []);
      ancestorStack.unshift(parentText);
      remId = parentRem.parent;
    }
    const remText = await plugin.richText.toString(rem.text || []);
    console.log(rem.children!.length, ancestorStack.join(' / '));
  }
}

export default function QueryBigRemCommand(plugin: RNPlugin, options: {} = {}): Command {
  return {
    ...COMMAND_INFO,
    action: async () => QueryBigRem(plugin),
  };
}

export async function testQueryBigRem(plugin: RNPlugin) {
  const TEST_CASES = [
    // [input, expectedOutput]
  ];
}
