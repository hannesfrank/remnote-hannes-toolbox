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

  const [cacheChecked, setCacheChecked] = useState(false);
  const [customPowerupsLoaded, setCustomPowerupsLoaded] = useState(false);
  const [customPowerupsLoading, setCustomPowerupsLoading] = useState(false);

  const [customPowerups, setCustomPowerups] = useState<Rem[] | undefined>();

  useTracker(async (plugin) => {
    if (cacheChecked) {
      pluginLog('Reusing cached powerups.');
      return;
    }

    const cachedIds = (await plugin.storage.getLocal(CUSTOM_POWERUP_REM_IDS)) as RemId[];
    if (!cachedIds) {
      setCacheChecked(true);
      setCustomPowerups(undefined);
      pluginLog('No cached powerups yet.');
      return;
    }

    const powerups = await plugin.rem.findMany(cachedIds);
    const foundPowerups = powerups?.filter((p) => p);
    // Assume powerups that were not found are deleted.
    // Remove them from cache.
    // Refinding fixes in case they are missing for another reason.
    if (foundPowerups) {
      await plugin.storage.setLocal(
        CUSTOM_POWERUP_REM_IDS,
        foundPowerups.map((p) => p._id)
      );
    }

    setCacheChecked(true);
    setCustomPowerups(foundPowerups);
    pluginLog('Finish loading powerups from cache.');
  });

  const findCustomPowerups = async () => {
    setCustomPowerupsLoading(true);

    console.time('Finding Powerups');
    console.timeLog('Finding Powerups', 'Fetching Builtin Powerups...');
    const powerupCodes = Object.values(BuiltInPowerupCodes);
    const powerupRemIds = await Promise.all(
      powerupCodes.map(async (code) => {
        const rem = await plugin.powerup.getPowerupByCode(code);
        return rem?._id;
      })
    );
    console.timeLog('Finding Powerups', 'Fetching Rem...');
    const allRem = await plugin.rem.getAll();
    console.timeLog('Finding Powerups', 'Checking Rem for Powerups...');
    const isPowerup = await Promise.all(allRem.map((r) => r.isPowerup()));
    console.timeLog('Finding Powerups', 'Filtering Powerups...');
    const customPowerups = allRem.filter(
      (rem, idx) => isPowerup[idx] && !powerupRemIds.includes(rem._id)
    );

    // Compare runtime, memory of reducing (sequential query) with map + index (theoretically parallel)
    // Result: They take the same time and roughly the same memory. Mapping is easier to read though :)
    // const customPowerups = await allRem.reduce(async (customPowerups, rem) => {
    //   const isPowerup = await rem.isPowerup();
    //   if (!isPowerup) return customPowerups;

    //   const isBuiltinPowerup = powerupRemIds.includes(rem._id);
    //   if (isBuiltinPowerup) return customPowerups;

    //   return (await customPowerups).concat(rem);
    // }, Promise.resolve([] as Rem[]));

    console.timeEnd('Finding Powerups');

    await plugin.storage.setLocal(
      CUSTOM_POWERUP_REM_IDS,
      customPowerups.map((r) => r._id)
    );

    setCustomPowerups(customPowerups);
    setCustomPowerupsLoading(false);
    setCustomPowerupsLoaded(true);
  };

  return (
    <>
      <H1>
        Custom Powerups
        {cacheChecked && customPowerups ? (
          <Button className="mx-2 align-bottom font-normal" onClick={findCustomPowerups}>
            Refind
          </Button>
        ) : null}
      </H1>

      {customPowerupsLoading ? (
        <span className="italic">
          Checking your KB for more powerups. This may take a few seconds...
        </span>
      ) : customPowerups ? (
        customPowerups.map((powerup) => <CustomPowerupRow key={powerup._id} remId={powerup._id} />)
      ) : cacheChecked /* && !customPowerups */ ? (
        <>
          <div>
            Your KB was not searched for plugin defined powerups yet. This may take a while
            depending on your KB size. Afterwards found powerups will be cached.
          </div>
          <Button onClick={findCustomPowerups}>Find Plugin Powerups</Button>
        </>
      ) : (
        <span className="italic">Checking Powerup Cache...</span>
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
