import { Command, RNPlugin } from '@remnote/plugin-sdk';
import { pluginWarn } from '../util/dev_util';
import { COMMAND_ID } from './SendReferenceToToday';

const COMMAND_INFO = {
  id: 'join-children-or-sibling-rem',
  name: 'Join children/siblings',
  description: 'Join children of a rem, or siblings if there are none, into a new rem.',
};

// RN_PLUGIN_TEST_MODE.add(COMMAND_ID);

export default function JoinChildrenCommand(plugin: RNPlugin, options: {} = {}): Command {
  return {
    ...COMMAND_INFO,
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      if (!rem) {
        pluginWarn(COMMAND_ID, 'Focus Rem first!');
        return;
      }

      let target = 'children';
      let remToMerge = await rem?.getChildrenRem();
      let parentOfMerge = rem;

      if (!remToMerge || remToMerge.length == 0) {
        target = 'siblings';
        // remToMerge = await rem?.siblingRem();
        // remToMerge.splice((await rem.positionAmongstVisibleSiblings()) || 0, 0, rem);
        remToMerge = await rem.visibleSiblingRem(); // This is bugged and includes rem, so no splicing.

        if (!remToMerge || remToMerge.length <= 1) {
          pluginWarn(COMMAND_ID, 'Could not get sibling rem.', remToMerge);
          return;
        } else {
          // Since remToMerge.length > 1 there must be a parent.
          const parentOfSiblings = await plugin.rem.findOne(rem.parent!);
          if (!parentOfSiblings) {
            pluginWarn(COMMAND_ID, 'Could not get parent rem.', parentOfSiblings);
            return;
          }
          parentOfMerge = parentOfSiblings;
        }
      }

      let ignore = await Promise.all(
        remToMerge.map(async (r) => (await r.isPowerupProperty()) || r.isProperty())
      );
      remToMerge = remToMerge.filter((r, idx) => !ignore[idx]);

      const mergedRem = await plugin.rem.createRem();
      // We avoid handling tags, descendants and backText for now by not handling deletion of current rem.
      const mergedText = remToMerge.flatMap((r, idx) => [
        ...(r.text || []),
        idx !== remToMerge.length - 1 ? '\n' : '',
      ]);
      await mergedRem?.setText(mergedText);
      await mergedRem?.setParent(parentOfMerge, 0);
    },
  };
}
