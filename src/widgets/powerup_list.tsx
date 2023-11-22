import { BuiltInPowerupCodes, renderWidget, usePlugin, useTracker } from '@remnote/plugin-sdk';
import Button from '../components/builtin/button';
import { H1, Small } from '../components/typography';
import '../style.css';

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

  const powerups = Object.entries(BuiltInPowerupCodes);

  return (
    <div className="h-full overflow-auto p-2">
      <H1 className="!mt-0">Builtin Powerups</H1>
      {powerups.map((powerup) => (
        <PowerupRow key={powerup[1]} powerup={powerup[0]} powerupCode={powerup[1]} />
      ))}
      <H1>Custom Powerups</H1>
    </div>
  );
};

const PowerupRow = (props: { powerup: string; powerupCode: string }) => {
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
