# Hannes's RemNote Toolbox

This is a sort of monorepo including my exploration with [RemNote's](https://remnote.com) plugin system.

The repo includes a variety commands and widgets I use for myself. Or someone requested them in Discord or the forum and I found them interesting enough to implement.
<!-- When they evolve past the prototype status or people find them genuinely useful I consider extracting them to a standalone plugin. -->

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

Join all children of a rem, or all siblings, if the focused rem has no children, into a new rem.

Use Case: When pasting into RemNote sometimes the content is split into too many lines.
This command helps with cleanup.

Note: This command creates a new rem with the joined content, and does not delete the old rem.
Thereby it avoid handling backText, descendants, tags and other special cases.
The user can delete the old rem manually after processing when satisfied with the result.

<!-- TODO: Image -->

#### Command: Send rem as reference to Today

Add a reference to the currently focused rem to Today's Document.

Use Case: Keep track of what you are working on.

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
  - I want to move commands and and widgets to their own plugin when they are stable.
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
- Daily Document Handling
  - Cannot reasonably get the rem for today/a specific date.
  - Cannot savely create a daily document.
- `REM_TYPE` should not be exported in addition to `RemType`.
- `RemColor` is exported, but Highlight color are literal strings and not an enum
  - `rem.getHighlightColor()` and `rem.setHighlightColor()` should use an enum
  - Same with todo status and font size. Work with enum values, not strings.
- Property handling
  - Inconsistency/redundance between powerup based properties (`rem.getPowerupProperty`, `rem.getPowerupPropertyAsRem`, `rem.getPowerupPropertyAsRichText`) and normal properties (`rem.getTagPropertyAsRem`, `rem.getTagPropertyValue`)
  - `plugin.powerup.getPowerupSlotByCode` should be renamed to property terminology
  - `rem.getTagPropertyAs..`
    - rename to just `getPropertyAs...`
    - take `RemId | Rem` as param
- `rem.taggedRem()` inconsistent with `rem.getTagRems` (missing `get` and pluralisation of Rem(s))


#### API Bugs

- richtext.split has wrong doc comment
- richtext.split(..., '+') fails because `/+/` is not a valid regex
- richtext.split does not return a RichTextInterface, but RichTextInterface[]
- Confusing: Looks like `rem.getEnablePractice()` is always `true` and `rem.getPracticeDirection()` is always `forward` for plain rem.
- `rem.visibleSiblingRem` includes `rem`, but `rem.siblingRem` does not.
  - Naming inconsistency with `getChildren`.
- `rem.setParent` does not add the the start of the rem as documented.
- `rem.collapse(portalId)` and `rem.expand(portalId, recurse)` always require a portal id. The signatures should be as follows:
  - `rem.collapse(portalContext?: RemId | Rem)`
  - `rem.expand(portalContext?: RemId | Rem)`
    - `rem.expand()` should have `recurse = false` as default (so it can be called without args)
    - Or even better: `rem.expandRecursive(portalContext?: RemId | Rem)` new method to avoid having to pass a default value (`undefined` for `portalContext` or `false` for `recurse`, depending on order).
  - `rem.isCollapsed(portalContext?: RemId | Rem)`
  - `rem.setIsCollapsed(isCollapsed: boolean, portalContext?: RemId | Rem)`
  - Workaround for v0.0.44: Pass `rem.parent` as portal context to `rem.collapse(...)` and `rem.expand(...)`.
- `plugin.focus.getFocusedRem()` returns the document when focusing on a rem in a property located in the document head

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
