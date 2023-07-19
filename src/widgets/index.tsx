import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { writeFileSync } from 'fs';

async function onActivate(plugin: ReactRNPlugin) {
  // A command that inserts text into the editor if focused.
  await plugin.app.registerCommand({
    id: 'editor-command',
    name: 'Write File',
    action: async () => {
      // await writeFileSync('/Users/hannesfrank/fromRemNote', "Hello from remnote");
      plugin.editor.insertPlainText('Hello World!');
    },
  });

  await plugin.app.registerCommand({
    id: 'editor-command3',
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
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
