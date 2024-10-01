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

**Use Case:** When pasting into RemNote sometimes the content is split into too many lines.
This command helps with cleanup.

Note: This command creates a new rem with the joined content, and does not delete the old rem.
Thereby it avoid handling backText, descendants, tags and other special cases.
The user can delete the old rem manually after processing when satisfied with the result.

<!-- TODO: Image -->

#### Command: Send rem as reference to Today

Add a reference to the currently focused rem to Today's Document.

**Use Case:** Keep track of what you are working on.

<!-- TODO: Image -->
