import {
  BuiltInPowerupCodes,
  Rem,
  RemId,
  renderWidget,
  usePlugin,
  useTracker,
} from '@remnote/plugin-sdk';
import Button from '../components/builtin/button';
import { H1, Small } from '../components/typography';
import '../style.css';
import { useState } from 'react';
import { pluginError, pluginLog, pluginWarn } from '../util/dev_util';

const CUSTOM_POWERUP_REM_IDS = 'powerup-list.powerup-rem-ids';

// * Features
// Get builtin powerups of the current KB
// Cache rem for each powerup in the KB
//    - Isolated cache for all KBs
// Find custom powerups
//    - native: use window method
//    - sandboxed: Iterate over all rem

// * UI
// For each powerup
//    - Before caching: Button to start loading
//    - ---
//    - Powerup Name
//    - Short description of what the powerup is for
//    - List slots for powerup
//    - Open Powerup
//    - Number of uses for powerup
//    - ? Delete custom Powerup
//    - ---
//    - Button at the bottom to find custom powerups

export const PowerupList = () => (
  <div className="h-full overflow-auto p-2">
    <BuiltinPowerupList />
    <CustomPowerupList />
  </div>
);

const BuiltinPowerupList = () => {
  const plugin = usePlugin();
  const powerups = Object.entries(BuiltInPowerupCodes);

  return (
    <>
      <H1 className="!mt-0">Builtin Powerups</H1>
      {powerups.map((powerup) => (
        <BuiltinPowerupRow key={powerup[1]} powerupName={powerup[0]} powerupCode={powerup[1]} />
      ))}
    </>
  );
};

const BuiltinPowerupRow = (props: { powerupName: string; powerupCode: string }) => {
  const powerup = useTracker(
    async (plugin) => await plugin.powerup.getPowerupByCode(props.powerupCode),
    [props.powerupCode]
  );
  return (
    <div className="flex gap-2 items-center my-1">
      <span className="font-semibold">{props.powerupName}</span>
      <Small className="rn-clr-content-tertiary">{props.powerupCode}</Small>
      <Button
        className="ml-auto"
        onClick={() => {
          void powerup?.openRemAsPage();
        }}
        disabled={!powerup}
      >
        Open
      </Button>
    </div>
  );
};

const CustomPowerupList = () => {
  const plugin = usePlugin();

  // !cacheChecked && !loaded: Find rem
  // cache empty: Find Rem
  // cacheChecked && !loaded: Cached list and refind button in heading
  // loaded: Update cache and
  const [cacheChecked, setCacheChecked] = useState(false);
  const [customPowerupsLoaded, setCustomPowerupsLoaded] = useState(false);
  const [customPowerupsLoading, setCustomPowerupsLoading] = useState(false);

  const [customPowerups, setCustomPowerups] = useState<Rem[]>([]);

  const cachedPowerups = useTracker(async (plugin) => {
    const cachedIds = (await plugin.storage.getLocal(CUSTOM_POWERUP_REM_IDS)) as RemId[];
    if (!cachedIds) {
      setCacheChecked(true);
      return undefined;
    }
    const powerups = await plugin.rem.findMany(cachedIds);
    const foundPowerups = powerups?.filter((p) => p);
    // Assume powerups that were not found are deleted.
    // Remove them from cache. Refinding fixes anyway.
    if (foundPowerups) {
      await plugin.storage.setLocal(
        CUSTOM_POWERUP_REM_IDS,
        foundPowerups.map((p) => p._id)
      );
    } else {
      console.warn('Cached powerup list is undefined.');
    }
    setCacheChecked(true);
  });

  const findCustomPowerups = async () => {
    setCustomPowerupsLoading(true);
    const allRem = await plugin.rem.getAll();
    const powerupRemIds = await Promise.all(
      powerups.map(async ([name, code]) => {
        const rem = await plugin.powerup.getPowerupByCode(code);
        return rem?._id;
      })
    );
    // const isPowerup = await Promise.all(allRem.map(r => r.isPowerup()));

    console.time('Powerup Checking');
    const customPowerups = await allRem.reduce(async (customPowerups, rem) => {
      const isPowerup = await rem.isPowerup();
      if (!isPowerup) return customPowerups;
      const isBuiltinPowerup = powerupRemIds.includes(rem._id);
      if (isBuiltinPowerup) return customPowerups;
      return (await customPowerups).concat(rem);
    }, Promise.resolve([] as Rem[]));
    console.timeEnd('Powerup Checking');
    console.log('CUSTOM POWERUPS', customPowerups);

    setCustomPowerups(customPowerups);
    setCustomPowerupsLoading(false);
    setCustomPowerupsLoaded(true);
    // TODO: cache them
  };

  return (
    <>
      <H1>Custom Powerups</H1>
      {customPowerupsLoaded ? (
        customPowerups.map((powerup) => <CustomPowerupRow key={powerup._id} remId={powerup._id} />)
      ) : customPowerupsLoading ? (
        <span className="italic">
          Checking your KB for more powerups. This may take a few seconds...
        </span>
      ) : (
        <Button onClick={findCustomPowerups}>Find Plugin Powerups</Button>
      )}
    </>
  );
};

const CustomPowerupRow = (props: { remId: string }) => {
  const powerup = useTracker(
    async (plugin) => {
      const rem = await plugin.rem.findOne(props.remId);
      const name = await plugin.richText.toString(rem?.text || ['Unknown Powerup']);
      return { rem, name };
    },
    [props.remId]
  );
  return (
    <div className="flex gap-2 items-center my-1">
      <span className="font-semibold">{powerup?.name}</span>
      <Small className="rn-clr-content-tertiary">{powerup?.rem?._id}</Small>
      <Button
        className="ml-auto"
        onClick={() => {
          void powerup?.rem?.openRemAsPage();
        }}
        disabled={!powerup}
      >
        Open
      </Button>
    </div>
  );
};

renderWidget(PowerupList);
