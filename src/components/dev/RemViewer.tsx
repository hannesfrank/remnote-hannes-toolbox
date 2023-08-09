import {
  AppEvents,
  Rem,
  RemId,
  useAPIEventListener,
  usePlugin,
  useTracker,
} from '@remnote/plugin-sdk';
import { H2, H3 } from '../typography';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { formatValue } from '../../util/dev_util';

/* 
 * All Rem Methods
 * 
positionAmongstSiblings: (portalId?: string) => Promise<number | undefined>;
positionAmongstVisibleSiblings: (portalId?: string) => Promise<number | undefined>;
hasPowerup: (powerupCode: BuiltInPowerupCodes | string) => Promise<boolean>;
getHiddenExplicitlyIncludedState: (portalId?: string) => Promise<'hidden' | 'included' | 'none' | undefined>;
setHiddenExplicitlyIncludedState: (hiddenExplicitlyIncludedState: 'hidden' | 'included' | 'none', portalId?: string) => Promise<void>;
getLastPracticed: () => Promise<number>;
addPowerup: (powerupCode: string | BuiltInPowerupCodes) => Promise<void>;
getLastTimeMovedTo: () => Promise<number>;
getSchemaVersion: () => Promise<number>;
embeddedQueueViewMode: () => Promise<boolean>;
isCollapsed: (portalId: string) => Promise<boolean>;
setIsCollapsed: (isCollapsed: boolean, portalId: string) => Promise<boolean>;
timesSelectedInSearch: () => Promise<number>;
getPortalType: () => Promise<PORTAL_TYPE>;
getPortalDirectlyIncludedRem: () => Promise<Rem[]>;
getType: () => Promise<RemType>;
setPowerupProperty: SetPowerupPropertyOverload;
getPowerupProperty: GetPowerupPropertyOverload;
getPowerupPropertyAsRichText: GetPowerupPropertyAsRichTextOverload;
setText: (text: RichTextInterface) => Promise<void>;
setBackText: (backText: RichTextInterface | undefined) => Promise<void>;
removeTag: (tagId: RemId, removeProperties?: boolean) => Promise<void>;
removePowerup: (powerupCode: BuiltInPowerupCodes | string) => Promise<void>;
addTag: (tag: RemId | Rem) => Promise<void>;
remove: () => Promise<void>;
getTagRems: () => Promise<Rem[]>;
addToPortal: (portal: RemId | Rem) => Promise<void>;
removeFromPortal: (portal: RemId | Rem) => Promise<void>;
setParent: (parent: RemId | Rem | null, positionAmongstSiblings?: number) => Promise<void>;
getOrCreateAliasWithText: (aliasText: RichTextInterface) => Promise<Rem | undefined>;
getChildrenRem: () => Promise<Rem[]>;
allRemInDocumentOrPortal: () => Promise<Rem[]>;
expand: (portal: RemId | Rem | undefined, recurse: boolean) => Promise<void>;
collapse: (portal: RemId | Rem | undefined) => Promise<void>;
siblingRem: () => Promise<Rem[]>;
visibleSiblingRem: (portalId?: string) => Promise<Rem[]>;
taggedRem: () => Promise<Rem[]>;
ancestorTagRem: () => Promise<Rem[]>;
descendantTagRem: () => Promise<Rem[]>;
getDescendants: () => Promise<Rem[]>;
getCards: () => Promise<Card[]>;
getAliases: () => Promise<Rem[]>;
getParentRem: () => Promise<Rem | undefined>;
portalsAndDocumentsIn: () => Promise<Rem[]>;
merge: (remIdToMergeIntoThisOne: RemId) => Promise<void>;
mergeAndSetAlias: (remToMergeIntoThisOne: RemId | Rem) => Promise<void>;
indent: (portal?: RemId | Rem) => Promise<void>;
outdent: (portal?: RemId | Rem) => Promise<void>;
setType: (type: SetRemType) => Promise<void>;
remsReferencingThis: () => Promise<Rem[]>;
remsBeingReferenced: () => Promise<Rem[]>;
deepRemsBeingReferenced: () => Promise<Rem[]>;
getSources: () => Promise<Rem[]>;
addSource: (source: RemId | Rem) => Promise<void>;
removeSource: (source: RemId | Rem) => Promise<void>;
isDocument: () => Promise<boolean>;
setIsDocument: (isDocument: boolean) => Promise<void>;
isListItem: () => Promise<boolean>;
setIsListItem: (isListItem: boolean) => Promise<void>;
isCardItem: () => Promise<boolean>;
setIsCardItem: (isCardItem: boolean) => Promise<void>;
isQuote: () => Promise<boolean>;
setIsQuote: (isQuote: boolean) => Promise<void>;
isCode: () => Promise<boolean>;
setIsCode: (isCode: boolean) => Promise<void>;
isTodo: () => Promise<boolean>;
setIsTodo: (isTodo: boolean) => Promise<void>;
getTodoStatus: () => Promise<'Finished' | 'Unfinished' | undefined>;
setTodoStatus: (todoStatus: 'Finished' | 'Unfinished') => Promise<void>;
getFontSize: () => Promise<'H1' | 'H2' | 'H3' | undefined>;
setFontSize: (fontSize: 'H1' | 'H2' | 'H3' | undefined) => Promise<void>;
getHighlightColor: () => Promise<string | undefined>;
setHighlightColor: (highlightColor: 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple') => Promise<void>;
isPowerup: () => Promise<boolean>;
isPowerupEnum: () => Promise<boolean>;
isPowerupPropertyListItem: () => Promise<boolean>;
isPowerupSlot: () => Promise<boolean>;
isPowerupProperty: () => Promise<boolean>;
isSlot: () => Promise<boolean>;
setIsSlot: (isSlot: boolean) => Promise<void>;
openRemInContext: () => Promise<void>;
openRemAsPage: () => Promise<void>;
getEnablePractice: () => Promise<boolean>;
getPracticeDirection: () => Promise<'forward' | 'backward' | 'none' | 'both'>;
setEnablePractice: (enablePractice: boolean) => Promise<void>;
setPracticeDirection: (direction: 'forward' | 'backward' | 'none' | 'both') => Promise<void>;
copyPortalReferenceToClipboard: () => Promise<void>;
copyTagReferenceToClipboard: () => Promise<void>;
copyReferenceToClipboard: () => Promise<void>;
 */

export function RemViewer(props: { remId: RemId; compact?: boolean }) {
  const plugin = usePlugin();
  const [remId, setRemId] = useState<RemId>('');
  const [remIdValid, setRemIdValid] = useState<boolean>(false);

  useAPIEventListener(AppEvents.FocusedRemChange, undefined, (args) => {
    console.log('Focus Rem, Args:', args);
  });

  const remToInspect = useTracker(
    async (plugin) => {
      let rem;
      if (remId) {
        if (remId.startsWith('[[') || remId.startsWith('##')) {
          rem = await plugin.rem.findOne(remId.substring(2));
        } else {
          rem = await plugin.rem.findOne(remId);
        }
        if (rem) {
          setRemIdValid(true);
        } else {
          setRemIdValid(false);
        }
      } else {
        rem = plugin.focus.getFocusedRem();
      }
      console.log(rem);
      return rem;
    },
    [remId]
  );

  return (
    <>
      <div>
        <div className="flex-nowrap flex items-center justify-start gap-1.5 py-1.5 ">
          <label htmlFor="remId" className="flex-shrink-0">
            Rem ID:
          </label>
          <input
            id="remId"
            className={clsx(
              'border group border-solid ring-transparent group box-border rn-clr-background-primary rn-clr-border-opaque ring-primary focus-within:rn-clr-border-selected transition-all px-2 duration-100 ease-in-out h-10 rounded',
              'placeholder:text-gray-30 rn-clr-content-primary focus:outline-none bg-transparent w-full'
            )}
            placeholder="Enter Rem ID. Inspecting focused Rem if empty."
            value={remId}
            onChange={(e) => setRemId(e.target.value)}
          />
        </div>
        {!remId && !remToInspect && (
          <div className="text-sm italic mb-2">Enter Rem ID or focus Rem.</div>
        )}
        {remId && !remIdValid && (
          <div className="text-sm italic mb-2">
            Rem with ID <span className="font-mono font-semibold">{remId}</span> could not be found.
          </div>
        )}
        {!remId && remToInspect && (
          <div className="text-sm italic mb-2">Inspecting Focused Rem.</div>
        )}
        {remToInspect && (
          <>
            <H3>Fields</H3>
            {/* Table with two columns: fieldname, value. */}
            <table className="table-auto table">
              <tbody>
                <FieldRow field="_id" value={remToInspect._id} />
                <FieldRow field="createdAt" value={remToInspect.createdAt} />
                <FieldRow field="localUpdatedAt" value={remToInspect.localUpdatedAt} />
                <FieldRow field="updatedAt" value={remToInspect.updatedAt} />
                <FieldRow field="parent" value={remToInspect.parent} />
                <FieldRow field="children" value={remToInspect.children} />
                <FieldRow field="type" value={remToInspect.type} />
                <FieldRow field="text" value={remToInspect.text} />
                <FieldRow field="backText" value={remToInspect.backText} />
              </tbody>
            </table>

            <H3>Getters</H3>
            {/* Table with two columns: fieldname, value. */}
            <table className="table-auto table">
              <tbody>
                <GetterRow method="positionAmongstSiblings" rem={remToInspect} />
                <GetterRow method="getLastPracticed" rem={remToInspect} />
                <GetterRow method="getLastTimeMovedTo" rem={remToInspect} />
                <GetterRow method="getSchemaVersion" rem={remToInspect} />
                <GetterRow method="embeddedQueueViewMode" rem={remToInspect} />
                {/* <GetterRow method="isCollapsed" rem={remToInspect} /> */}
                <GetterRow method="getPortalType" rem={remToInspect} />
                <GetterRow method="getPortalDirectlyIncludedRem" rem={remToInspect} />
                <GetterRow method="getType" rem={remToInspect} />
                <GetterRow method="getTagRems" rem={remToInspect} />

                <GetterRow method="getEnablePractice" rem={remToInspect} />
                <GetterRow method="getPracticeDirection" rem={remToInspect} />
                <GetterRow method="isDocument" rem={remToInspect} />
                <GetterRow method="isListItem" rem={remToInspect} />
                <GetterRow method="isCardItem" rem={remToInspect} />
                <GetterRow method="isQuote" rem={remToInspect} />
                <GetterRow method="isCode" rem={remToInspect} />
                <GetterRow method="isTodo" rem={remToInspect} />
                <GetterRow method="getTodoStatus" rem={remToInspect} />
                <GetterRow method="getFontSize" rem={remToInspect} />
                <GetterRow method="getHighlightColor" rem={remToInspect} />
                <GetterRow method="isSlot" rem={remToInspect} />
                <GetterRow method="isPowerup" rem={remToInspect} />
                <GetterRow method="isPowerupEnum" rem={remToInspect} />
                <GetterRow method="isPowerupPropertyListItem" rem={remToInspect} />
                <GetterRow method="isPowerupSlot" rem={remToInspect} />
                <GetterRow method="isPowerupProperty" rem={remToInspect} />
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}

const FieldRow = (props: { field: string; value: unknown }) => {
  return (
    <tr className="font-mono text-sm">
      <td className="pr-2">{props.field}</td>
      <td>{formatValue(props.value)}</td>
    </tr>
  );
};

// TODO: Add docs link and show possible values in case of enum. Maybe reuse component.
const GetterRow = (props: { method: string; rem: Rem }) => {
  // This updates only on rem change, but at least we can distinguish
  // undefined values from tracker not returning yet.
  // Probably does not matter so I just use useTracker.
  //   const [value, setValue] = useState<unknown>();
  //   const [resolved, setResolved] = useState<boolean>(false);

  //   useEffect(() => {
  //     async function getValue() {
  //       const method = props.rem[props.method];
  //       if (method) {
  //         const value = await props.rem[props.method]();
  //         setValue(value);
  //         setResolved(true);
  //       }
  //     }
  //     getValue();
  //   }, [props.rem._id]);

  const value = useTracker(() => {
    return props.rem[props.method]();
    // return props.rem.getTagRems();
  }, [props.rem._id]);

  // NVM, this is not reactive either

  return (
    <tr className="font-mono text-sm">
      <td className="pr-2">{props.method}()</td>

      <td>{formatValue(value)}</td>
    </tr>
  );
};
