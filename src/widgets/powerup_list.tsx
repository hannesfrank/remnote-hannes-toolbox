import { BuiltInPowerupCodes, Rem, renderWidget, usePlugin, useTracker } from '@remnote/plugin-sdk';
import Button from '../components/builtin/button';
import { H1, Small } from '../components/typography';
import '../style.css';
import { useState } from 'react';

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

export const PowerupList = () => {
  const plugin = usePlugin();

  const [customPowerupsLoaded, setCustomPowerupsLoaded] = useState(false);
  const [customPowerupsLoading, setCustomPowerupsLoading] = useState(false);
  const [customPowerups, setCustomPowerups] = useState<Rem[]>([]);

  const powerups = Object.entries(BuiltInPowerupCodes);
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
    <div className="h-full overflow-auto p-2">
      <H1 className="!mt-0">Builtin Powerups</H1>
      {powerups.map((powerup) => (
        <BuiltinPowerupRow key={powerup[1]} powerupName={powerup[0]} powerupCode={powerup[1]} />
      ))}
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
    </div>
  );
};

const BuiltinPowerupRow = (props: { powerupName: string; powerupCode: string }) => {
  const powerup = useTracker(
    async (plugin) => await plugin.powerup.getPowerupByCode(props.powerupCode),
    [props.powerupCode]
  );
  return (
    <div className="flex gap-2 items-center my-1">
      <span className="font-semibold">{props.powerup}</span>
      <Small className="rn-clr-content-tertiary">{props.powerupCode}</Small>
      <Button
        className="ml-auto"
        onClick={() => {
          console.log('opening', powerup);
          void powerup?.openRemAsPage();
        }}
        disabled={!powerup}
      >
        Open
      </Button>
    </div>
  );
};

renderWidget(PowerupList);
