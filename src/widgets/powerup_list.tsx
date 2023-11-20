import { BuiltInPowerupCodes, renderWidget, usePlugin, useTracker } from '@remnote/plugin-sdk';
import Button from '../components/builtin/button';
import { H1, Small } from '../components/typography';
import '../style.css';

export const PowerupList = () => {
  const plugin = usePlugin();

  const powerups = Object.entries(BuiltInPowerupCodes);
  return (
    <div className="mx-2">
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
