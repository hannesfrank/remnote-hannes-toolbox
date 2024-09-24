import { BuiltInPowerupCodes, Command, PowerupSlotCodeMap, RNPlugin } from '@remnote/plugin-sdk';
import { pluginWarn } from '../util/dev_util';

export const COMMAND_ID = 'send-reference-to-today';
export const COMMAND_NAME = 'Send rem as reference to Today';
export const COMMAND_DESCRIPTION = 'Send rem as reference to Today';

// RN_PLUGIN_TEST_MODE.add(COMMAND_ID);

// TODO: Allow prefixing with timestamp.
// TODO: Allow sending to other rem.
// TODO: Configure path on todays document where the rem is sent to. E.g. "Today > Focus Log"

export default function SendReference(plugin: RNPlugin, options: {} = {}): Command {
  return {
    id: COMMAND_ID,
    name: COMMAND_NAME,
    description: COMMAND_DESCRIPTION,

    action: async () => {
      const remToSend = await plugin.focus.getFocusedRem();
      if (!remToSend) {
        pluginWarn(COMMAND_ID, 'Focus Rem first!');
        return;
      }

      const dailyDocumentPowerup = await plugin.powerup.getPowerupByCode(
        BuiltInPowerupCodes.DailyDocument
      );

      const dailyDocuments = await dailyDocumentPowerup?.taggedRem();

      if (!dailyDocuments) {
        pluginWarn(COMMAND_ID, 'Could not get Daily Documents.', dailyDocuments);
        return;
      }
      const dailyDocsMap = new Map();
      // Figuring out getting property values
      //#region experiment
      // const dailyDocument = dailyDocuments[0];
      // console.log('dailyDocument', dailyDocument);

      // // TODO: How do I get all the property config like PropertyLocation and PropertyType?
      // const dateProperty = (await plugin.powerup.getPowerupSlotByCode(
      //   BuiltInPowerupCodes.DailyDocument,
      //   'Date'
      // ))!;
      // console.log('Date Slot', dateProperty?.text, dateProperty);
      // console.log('getTagPropertyAsRem', await dailyDocument.getTagPropertyAsRem(dateProperty._id));
      // console.log('getTagPropertyValue', await dailyDocument.getTagPropertyValue(dateProperty._id));
      // console.log(
      //   'getPowerupProperty',
      //   await dailyDocument.getPowerupProperty(BuiltInPowerupCodes.DailyDocument, 'Date')
      // );
      // console.log(
      //   'getPowerupPropertyAsRem',
      //   await dailyDocument.getPowerupPropertyAsRem(BuiltInPowerupCodes.DailyDocument, 'Date')
      // );
      // console.log(
      //   'getPowerupPropertyAsRichText',
      //   await dailyDocument.getPowerupPropertyAsRichText(BuiltInPowerupCodes.DailyDocument, 'Date')
      // );
      //#endregion

      const todayStr = new Date().toISOString().split('T')[0];
      let todayDocument = undefined;
      for (const dailyDoc of dailyDocuments) {
        const date = await dailyDoc.getPowerupProperty(BuiltInPowerupCodes.DailyDocument, 'Date');
        if (date === todayStr) {
          todayDocument = dailyDoc;
          break;
        }
      }
      if (!todayDocument) {
        pluginWarn(COMMAND_ID, 'Could not find today document', todayDocument);
        plugin.app.toast("Please create today's document first!");
        return;
      }

      const referenceRem = await plugin.rem.createRem();

      await referenceRem?.setText(await plugin.richText.rem(remToSend).value());
      referenceRem?.setParent(todayDocument);
    },
  };
}
