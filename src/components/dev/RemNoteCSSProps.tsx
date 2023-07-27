import { usePlugin, useRunAsync } from '@remnote/plugin-sdk';
import { useMemo } from 'react';
import { isSandboxed } from '../../util/plugin_util';

enum CSSSelectors {
  General = ':root body',

  ColorsLight = '.light',
  ColorsDark = '.dark',

  ThemeLight = ':root body.light',
  ThemeDark = ':root body.dark',
}

const CSS_PROPS_SECTIONS = {
  General: CSSSelectors.General,

  Light: {
    Colors: CSSSelectors.ColorsLight,
    Theme: CSSSelectors.ThemeLight,
  },

  Dark: {
    Colors: CSSSelectors.ColorsDark,
    Theme: CSSSelectors.ThemeDark,
  },
};

function parseProps(cssRule: CSSRule) {
  const cssText = (cssRule as CSSStyleRule).cssText;
  const cssTextSplit = cssText.split('{')[1].split('}')[0].trim().split(';');
  const props = cssTextSplit
    .filter((text) => text.trim() !== '')
    .map((text) => text.split(':'))
    .filter(([prop, _]) => prop.trim().startsWith('--'))
    .map(([prop, value]) => ({ prop: prop.trim(), value: value.trim() }));
  return props;
}

function useSelectorProps(cssRules: CSSRule[], selector: string) {
  return useMemo(() => {
    const rules = cssRules.filter(
      (cssRule) => 'selectorText' in cssRule && cssRule.selectorText === selector
    );
    const props = rules.map(parseProps).flat();
    return props;
  }, [selector]);
}

function RemNoteCSSProps() {
  const cssRules = useMemo(
    () =>
      Array.from(document.styleSheets)
        .filter((styleSheet) => {
          try {
            return styleSheet.cssRules;
          } catch (e) {
            console.warn(e);
          }
        })
        .map((styleSheet) => Array.from(styleSheet.cssRules))
        .flat(),
    []
  );

  const general = useSelectorProps(cssRules, CSSSelectors.General);

  const lightTheme = useSelectorProps(cssRules, CSSSelectors.ThemeLight);
  const darkTheme = useSelectorProps(cssRules, CSSSelectors.ThemeDark);

  const lightColors = useSelectorProps(cssRules, CSSSelectors.ColorsLight);
  const darkColors = useSelectorProps(cssRules, CSSSelectors.ColorsDark);

  // const selectorsWithProps = useMemo(() => {
  //   const allSelectors = cssRules
  //     .filter((cssRule) =>
  //       cssRule.cssText
  //         .split('{')[1]
  //         .split('}')[0]
  //         .trim()
  //         .split(';')
  //         .some((text) => text.split(':')[0].trim().startsWith('--'))
  //     )
  //     .filter((cssRule) => !!cssRule.selectorText);
  //   // .map((cssRule) => (cssRule as CSSStyleRule).selectorText);
  //   console.log(allSelectors);
  //   const uniqueSelectors = new Set(allSelectors);
  //   return uniqueSelectors;
  // }, []);

  // .filter(
  //         (cssRule) =>
  //           cssRule.selectorText?.startsWith(':root') ||
  //           ['.light', '.dark'].includes(cssRule.selectorText)
  //       )
  //       .map((cssRule) => cssRule.cssText.split('{')[1].split('}')[0].trim().split(';'))
  //       .flat()
  //       .filter((text) => text !== '')
  //       .map((text) => text.split(':'))
  //       .map((parts) => ({ prop: parts[0].trim(), value: parts[1].trim() })),
  //   []
  // );

  return (
    // TODO: Filter, structure and sort alphabetically
    <>
      <h2>CSS Custom Properties</h2>
      <h3>Rules with CSS Props</h3>
      {/* <ul>
        {[...selectorsWithProps].map((cssRule) => (
          <li key={cssRule.cssText}>{cssRule.cssText}</li>
        ))}
      </ul> */}
      <h3>RemNote</h3>
      {/* <ul>
        {rnCSSVariables.map((cssVariable) => (
          <li key={cssVariable.prop}>
            {cssVariable.prop}: {cssVariable.value}
          </li>
        ))}
      </ul> */}
      {
        <ul className="p-0">
          {lightColors.map((cssVariable) => (
            <li key={cssVariable.prop} className="list-none ">
              <CSSProp {...cssVariable} />
            </li>
          ))}
        </ul>
      }
    </>
  );
}

function CSSProp(props: { prop: string; value: string }) {
  // TODO: Click to copy value
  // TODO: Special display for colors/sizes
  // Q: how to decide for var() props?
  const plugin = usePlugin();
  const platform = useRunAsync(plugin.app.getPlatform, []);

  function copyValue() {
    if (isSandboxed() || platform !== 'app') {
      // TODO: Allow copy in sandbox
      console.log('Cannot copy value in sandbox');
      return;
    }

    navigator.clipboard.writeText(props.value);
  }

  return (
    <span
      className="cursor-pointer hover:rn-clr-content-secondary font-mono text-xs"
      onClick={copyValue}
    >
      {props.prop}: <CSSValue value={props.value} />
    </span>
  );
}

function CSSValue(props: { value: string }) {
  if (props.value.startsWith('var')) return <>{props.value}</>;
  if (props.value.startsWith('calc')) return <>{props.value}</>;
  if (props.value.startsWith('hsl') || props.value.startsWith('rgb') || props.value.startsWith('#'))
    return (
      <>
        <ColorBox color={props.value} /> {props.value}
      </>
    );
  return <span className="font-mono">{props.value}</span>;
}

function ColorBox(props: { color: string }) {
  return (
    <span
      className="w-3 h-3 inline-block rounded-sm"
      style={{
        backgroundColor: props.color,
        border: '1px solid var(--rn-colors-gray-60)',
      }}
    />
  );
}

export default RemNoteCSSProps;
