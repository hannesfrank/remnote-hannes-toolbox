import { BuiltInPowerupCodes, renderWidget, usePlugin } from '@remnote/plugin-sdk';
import { H1, Small } from '../components/typography';
import '../style.css';

export const PowerupList = () => {
  const plugin = usePlugin();

  console.log(BuiltInPowerupCodes);
  console.log(Object.keys(BuiltInPowerupCodes));
  console.log(Object.values(BuiltInPowerupCodes));
  console.log(Object.entries(BuiltInPowerupCodes));
  const powerups = Object.entries(BuiltInPowerupCodes);

  return (
    <div className="mx-2">
      <H1 className="!mt-0">Builtin Powerups</H1>
      {powerups.map((powerup) => (
        <PowerupRow powerup={powerup[0]} powerupShortcode={powerup[1]} />
      ))}
      <H1>Custom Powerups</H1>
    </div>
  );
};

const PowerupRow = (props: { powerup: string; powerupShortcode: string }) => (
  <div key={props.powerupShortcode}>
    {props.powerup} <Small className="rn-clr-content-tertiary">{props.powerupShortcode}</Small>
  </div>
);

renderWidget(PowerupList);
