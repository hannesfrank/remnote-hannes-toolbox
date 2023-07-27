import {
  RICH_TEXT_ELEMENT_TYPE,
  RICH_TEXT_FORMATTING,
  RNPlugin,
  RichTextInterface,
} from '@remnote/plugin-sdk';
import _ from 'lodash';
import { RN_PLUGIN_TEST_MODE } from '../util/plugin_util';

const COMMAND_ID = 'format-keyboard-shortcut';
const COMMAND_NAME = 'Format Back as Keyboard Shortcut';

// RN_PLUGIN_TEST_MODE.add(COMMAND_ID);

// This transforms formats keys it finds in RichTextInterface and ignores/preserves the rest.
// If this is to buggy a more robust way is to
//  - format as text
//  - use a text-based keyboard parsing lib/function
//  - recreate the formatted rich text.
// TODO: Is this too buggy?
// TODO: Transform keys to macos symbols
export async function formatKeyboardShortcut(
  unformattedShortcutRichText: RichTextInterface,
  plugin: RNPlugin
) {
  // TODO: richtext splitting is buggy, e.g. /+/ is not a valid regex when splitting with +
  // This seems bery buggy, e.g.
  // > const test = await plugin.richText.split(['a+b+', { i: 'm', text: 'c' }], '\\+');
  // > console.log(JSON.stringify(test));
  // > > [["a"],[""],["",{"i":"m","text":"c"}]]
  // Where is b?

  // Splitting myself...
  const key_parts = [];
  for (const part of unformattedShortcutRichText) {
    if (typeof part === 'string') {
      // Using a regex group keeps the separators + and , as items in the string
      key_parts.push(...part.split(/([+,])/));
    } else if (part.i === RICH_TEXT_ELEMENT_TYPE.TEXT) {
      // TODO: Do we want to do anything here?
      key_parts.push(part);
    } else {
      key_parts.push(part);
    }
  }

  const parts = [];
  let after_comma = false;
  let after_plus = false;

  for (const part of key_parts) {
    if (typeof part === 'string') {
      if (part.trim() === '') {
        continue;
      }
      const expect_key = after_plus || after_comma || parts.length == 0;
      if (part === '+' && !expect_key) {
        parts.push(' + ');
        after_plus = true;
      } else if (part === ',' && !expect_key) {
        parts.push(', ');
        after_comma = true;
      } else {
        parts.push(formatBold(part.trim()));
        after_comma = false;
        after_plus = false;
      }
    } else if (part.i === RICH_TEXT_ELEMENT_TYPE.TEXT) {
      parts.push({
        ...part,
        text: part.text.trim(),
        [RICH_TEXT_FORMATTING.BOLD]: true,
      });
    } else {
      parts.push(part);
      // Maybe even abort here and don't to anything?
    }
  }

  const shortcutRichText = await plugin.richText.normalize(parts);

  // console.log('unformatted:', unformattedShortcutRichText);
  // console.log('Key parts:', key_parts);
  // console.log('Parts:', parts);
  // console.log('RichText:', shortcutRichText);
  return shortcutRichText;
}

export default function FormatKeyboardShortcutCommand(plugin: RNPlugin) {
  return {
    id: COMMAND_ID,
    name: COMMAND_NAME,
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      if (!rem || !rem.backText) {
        plugin.app.toast('Rem has no shortcut on backside.');
        return;
      }
      const unformattedShortcutRichText = rem.backText;
      const shortcutRichText = await formatKeyboardShortcut(unformattedShortcutRichText, plugin);
      await rem.setBackText(shortcutRichText);
    },
  };
}

// TODO: Proper testing with vitest?
export async function testFormatKeyboardShortcut(plugin: RNPlugin) {
  const SHORTCUT_TEST_CASES = [
    // Plus and comma
    [['Cmd + K'], ['[B]Cmd[/B] + [B]K[/B]']],
    [['A, B'], ['[B]A[/B], [B]B[/B]']],

    // Irregular spaces
    [['Cmd+K + L'], ['[B]Cmd[/B] + [B]K[/B] + [B]L[/B]']],

    // Comma and plus as keys
    [['Cmd+,'], ['[B]Cmd[/B] + [B],[/B]']],
    [['Cmd+K, Cmd++'], ['[B]Cmd[/B] + [B]K[/B], [B]Cmd[/B] + [B]+[/B]']],
    [[',,,'], ['[B],[/B], [B],[/B]']],

    // Mixed with formatted rich text
    // TODO: more test cases
  ];

  for (const [shortcut, expected] of SHORTCUT_TEST_CASES) {
    const result = await formatKeyboardShortcut(shortcut, plugin);
    if (_.isEqual(result, expected) === false) {
      console.error(`Shortcut '${shortcut}' failed: ${result} !== ${expected}`);
    } else {
      console.log(`Shortcut '${shortcut}' passed.`);
    }
  }
}

function formatBold(text: string) {
  if (RN_PLUGIN_TEST_MODE.has(COMMAND_ID)) {
    return `[B]${text}[/B]`;
  }
  return {
    text,
    i: RICH_TEXT_ELEMENT_TYPE.TEXT,
    [RICH_TEXT_FORMATTING.BOLD]: true,
  };
}
