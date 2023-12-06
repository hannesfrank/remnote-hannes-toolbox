import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { writeFileSync } from 'fs';
import { isDevMode, isSandboxed, RN_PLUGIN_TEST_MODE } from '../util/plugin_util';
import FormatKeyboardShortcutCommand, {
  testFormatKeyboardShortcut,
  COMMAND_ID as FormatKeyboardShortcutCommandId,
} from '../commands/FormatKeyboardShortcutCommand';
import { REM_IDS } from '../constants/remIds';
import JoinChildrenCommand from '../commands/JoinChildren';

async function onActivate(plugin: ReactRNPlugin) {
  if (isDevMode()) {
    // Chrome console formatting
    console.log(
      '%cPlugin hannes-remnote-toolbox running in dev mode.',
      'color: #ff0000; font-weight: bold;'
    );
  }

  const os = await plugin.app.getOperatingSystem();
  const platform = await plugin.app.getPlatform();

  if (
    !['windows', 'linux', 'macos'].includes(os) ||
    platform === 'web' ||
    (!isDevMode() && isSandboxed())
  ) {
    plugin.app.toast(
      "Hannes' RemNote Toolbox needs to run in native mode on the Desktop App to enable all functions."
    );
  }

  await plugin.app.registerCommand({
    id: 'editor-command',
    name: 'Write File',
    action: async () => {
      // await writeFileSync('/Users/hannesfrank/fromRemNote', "Hello from remnote");
      plugin.editor.insertPlainText('Hello World!');
    },
  });

  await plugin.app.registerWidget('dev_dashboard', WidgetLocation.Pane, {});

  await plugin.app.registerCommand({
    id: 'toggle-dev-pane',
    name: 'Show Dev Dashboard',
    action: async () => {
      plugin.window.openWidgetInPane('dev_dashboard');
    },
  });
  // XXX: Not sure if nicer as floating window, but I cannot register a widget in multiple locations unfortunately.
  // await plugin.app.registerCommand({
  //   id: 'toggle-dev-pane',
  //   name: 'Show Dev Dashboard (Floating)',
  //   action: async () => {
  //     plugin.window.openFloatingWidget('dev_dashboard', {});
  //   },
  // });

  await plugin.app.registerWidget('powerup_list', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
    // Title is not visible in sidebar when icon is present
    widgetTabTitle: 'Powerups',
    // For icon use data url generated from https://iconify.design/
    widgetTabIcon:
      'data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="32" height="32" viewBox="0 0 32 32"%3E%3Cpath fill="currentColor" d="M16 3C8.832 3 3 8.832 3 16s5.832 13 13 13s13-5.832 13-13S23.168 3 16 3zm0 2c6.087 0 11 4.913 11 11s-4.913 11-11 11S5 22.087 5 16S9.913 5 16 5zm0 3.875l-.72.72l-5.686 5.686L11 16.72l4-4V23h2V12.72l4 4l1.406-1.44l-5.687-5.686l-.72-.72z"%2F%3E%3C%2Fsvg%3E',
  });

  // Commands
  await plugin.app.registerCommand(
    FormatKeyboardShortcutCommand(plugin, {
      getShortcutTag: async () =>
        (await plugin.kb.getCurrentKnowledgeBaseData()).name == 'hannesfrank'
          ? REM_IDS.SHORTCUT_TAG
          : null,
    })
  );

  await plugin.app.registerCommand(JoinChildrenCommand(plugin));

  if (isDevMode() && RN_PLUGIN_TEST_MODE.has(FormatKeyboardShortcutCommandId)) {
    await testFormatKeyboardShortcut(plugin);
  }

  plugin.app.stealKeys(['opt+v']);
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
