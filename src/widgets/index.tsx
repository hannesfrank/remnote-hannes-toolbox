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

  // Register a sidebar widget.
  // await plugin.app.registerWidget('sample_widget', WidgetLocation.RightSidebar, {
  //   dimensions: { height: 'auto', width: '100%' },
  // });

  // Commands
  await plugin.app.registerCommand(
    FormatKeyboardShortcutCommand(plugin, {
      getShortcutTag: async () =>
        (await plugin.kb.getCurrentKnowledgeBaseData()).name == 'hannesfrank'
          ? REM_IDS.SHORTCUT_TAG
          : null,
    })
  );

  if (isDevMode() && RN_PLUGIN_TEST_MODE.has(FormatKeyboardShortcutCommandId)) {
    await testFormatKeyboardShortcut(plugin);
  }
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
