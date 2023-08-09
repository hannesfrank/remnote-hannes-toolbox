import { Rem } from '@remnote/plugin-sdk';

export function isRem(obj: any) {
  // For some reason initially `instanceof Rem` was always false.
  // This alternative would also work.
  // obj?.__proto__?.constructor?.name === 'Rem'
  // return obj && obj.__proto__ === Rem.prototype;
  return obj instanceof Rem;
}

export function formatValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'undefined') {
    return <em>undefined</em>;
  }
  if (isRem(value)) {
    return `Rem(${JSON.stringify({
      // @ts-ignore
      id: value?._id,
      // @ts-ignore
      text: value?.text,
    })})`;
  }
  return JSON.stringify(value);
}
