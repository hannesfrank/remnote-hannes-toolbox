# Hannes's RemNote Toolbox

This is a sort of monorepo including my exploration with [RemNote's](https://remnote.com) plugin system.

The repo includes a variety commands and widgets I use for myself or someone else requested. When they evolve past the prototype status or people find them genuinely useful I consider extracting them to a standalone plugin.

Furthermore this repo includes tools and components to aid the plugin making process.

- An [API Explorer](#in-progress-plugin-api-explorer) to get familiar the SDK.
- React components mimmicking RemNote's design system.
- Utility functions (logging, formatting, rem creation, checking plugin environment)
- Additional components (dialogs)

## Features

### [In Progress] Plugin API Explorer

This pane helps you explore various aspects of the API:

- Live update of return value of API endpoints.
- `rn-` token overview.
- Event Viewer
- More to come...

### [In Progress] Keyboard Shortcut Practice

Learn keyboard shortcuts of your apps.

Provides

- CSS to style keyboard shortcuts in the editor and the queue.
- Organisational framework (`#Application`, `#Shortcut`).
- Shortcut recording helper (Command: Format shortcut, Command: Record shortcut).
- Queue Widget asking you to press the shortcut.

#### Command: Format as Keyboard Shortcut

<!-- TODO: Image -->

Format the back side of a rem to match the formatting needed for the shortcut custom CSS.

### Editor Commands

#### Command: Join children/siblings of a rem.

<!-- TODO: Image -->

## Notes

### Building the plugin

Some features use builtin node modules like `fs` that are available in the electron app.
To allow access to those the plugin must be built with `target: "node"` set in `webpack.config.js`
and run in native mode.

As live reloading in native mode is not supported (you need to Ctrl + R the whole app) while
development it is still `target: "web"`.

Tasks:

- [ ] Automate command composition.
  - I wnat to move commands and and widgets to their own plugin when they are stable.
  - To avoid having to touch `index.html` each time it should load them automatically.
  - [ ] Add a node script that iterates `/commands` and generates a `commands.tsx` file that registers each command.
  - [ ] Include as built step in `package.json`.
- [ ] Figure out how to deploy a new plugin version via CLI.

### SDK enhancements

- Permissions do not autoupdate when editing the manifest, need to reinstall
- plugin-sdk init:
  - Autor with space creates invalid id (containing space)
  - plugin-sdk script has no help
  - Hard to figure out permissions
    - Should be set by init script asking the user if they want to modify stuff?
  - manifest.json has no schema/autocomplete (e.g. for permissions)
  - README.md is empty
- Plugin template uses tailwind with default theme colors, e.g. scale 100-900. This messes up autocomplete.
- Comfortable way to manipulate rich text, e.g. to map and replace something
  - Comfortable pattern to check for and handle different rich text item types. Like a match statement.
- `registerCommand`
  - Does not respect `icon`.
  - Should use the plugin icon as default icon.
  - Should provide context depending on when the command was triggered (global, in editor, with selected text, with selected rem), or document pattern for each.
- Support setting title in plugin panes.
  - How does the plugin store data in the `paneIdToDocumentIdMap`? I know Bijay made this.
- Given a powerup rem you cannot get its `powerupCode`. E.g. to analyse custom powerups.

#### API Bugs

- richtext.split has wrong doc comment
- richtext.split(..., '+') fails because `/+/` is not a valid regex
- richtext.split does not return a RichTextInterface, but RichTextInterface[]
- Confusing: Looks like `rem.getEnablePractice()` is always `true` and `rem.getPracticeDirection()` is always `forward` for plain rem.
- `rem.visibleSiblingRem` includes `rem`, but `rem.siblingRem` does not.
  - Naming inconsistency with `getChildren`.
- `rem.setParent` does not add the the start of the rem as documented.

Unclear:

- How is styling supposed to work?
  - In dev mode custom tailwind props are not recognized.
  - In webpack it disables `MiniCssExtractPlugin` when `isDevelopment`.
  - Do I really need to import `style.css` in each widget I want to use it?
  - The production build includes my custom tailwind props, but I'm not sure if/when the files are loaded.

### Dev Tips

- Live Reloading does not work with native. I think this would need quite a bit of work to make hot reloading behave inside electron anyway?
  - You can still reload manually quite quickly with Cmd + R.
- There is a bug with `@tailwind base` in native plugins: The borders of `.TreeNodes` because of tailwinds Preflight rules. Use the following code to fix.

```css
#hierarchy-editor .TreeNode {
  border-width: 0px;
  border-left-width: 1px;
}
```

- You need to restart `npm run dev` after adding/removing a widget.
- `plugin.app.stealKeys` uses `plugin.id` as listener key. To listen to keys, use `useEventListener(AppEvents.StealKeys, plugin.id, ...)`.
- Widget icons need a URL. But you can use a data url, e.g. from [iconify.design](https://iconify.design/)
