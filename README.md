# Hannes's RemNote Toolbox

## Commands

### Format as Keyboard Shortcut

<!-- TODO: Image -->

Format the back side of a rem to match the

## Notes

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

#### API Bugs

- richtext.split has wrong doc comment
- richtext.split(..., '+') fails because `/+/` is not a valid regex
- richtext.split does not return a RichTextInterface, but RichTextInterface[]
- Confusing: Looks like `rem.getEnablePractice()` is always `true` and `rem.getPracticeDirection()` is always `forward` for plain rem.

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

### Roadmap

### Todo

- Check if in dev mode using URL == localhost
- If in dev mode, patch some native stuff so I can better run sandboxed with hot reload
- Check if desktop app,;,:;:,,
