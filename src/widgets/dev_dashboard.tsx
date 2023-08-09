import { AppEvents, RNPlugin, Rem, renderWidget, usePlugin, useTracker } from '@remnote/plugin-sdk';
import { ReactNode, createContext, useContext } from 'react';
import { EventViewer } from '../components/dev/EventViewer';
import RemNoteCSSProps from '../components/dev/RemNoteCSSProps';
import '../style.css';
import { H1, H2, H3 } from '../components/typography';

export const DevDashboard = () => {
  const plugin = usePlugin();

  return (
    <div className="mx-2">
      <H1 className="!mt-0">RemNote API Dashbard</H1>
      <H2>Namespaces</H2>
      {/* TODO: Add more API commands */}
      <APINamespace name="app">
        <APIMethod method="getOperatingSystem" />
        <APIMethod method="getPlatform" />
      </APINamespace>
      <APINamespace name="focus">
        <APIMethod method="getFocusedRem" />
      </APINamespace>
      <APINamespace name="editor">
        <APIMethod method="getFocusedEditorText" />
        <APIMethod method="getSelection" />
      </APINamespace>
      <H2>Events</H2>
      <div className="columns-[180px] font-mono text-xs w-full">
        {/* TODO: Support start/stop listening to other events here.
                Do I need to add an input for arbitrary listener keys or can I listen to everything?
          */}
        {Object.keys(AppEvents)
          .filter((event) => !['onActivate', 'onDeactivate'].includes(event))
          .sort()
          .map((event) => (
            <div className="overflow-ellipsis overflow-hidden whitespace-nowrap" key={event}>
              {event}
            </div>
          ))}
      </div>
      <EventViewer event={AppEvents.StealKeyEvent} enabled />
      <RemNoteCSSProps />
    </div>
  );
};

const APINamespace = ({ name, children }: { name: keyof RNPlugin; children: ReactNode }) => (
  <APINamespaceContext.Provider value={name}>
    <div className="my-2">
      <H3 className="font-mono">{name}</H3>
      {children}
    </div>
  </APINamespaceContext.Provider>
);

const APINamespaceContext = createContext<keyof RNPlugin>('editor');

const APIMethod = (
  props: { method: string; value?: (plugin: RNPlugin) => unknown },
  doc?: ReactNode | string
) => {
  const namespace = useContext(APINamespaceContext);
  const defaultValueFunc = (plugin: RNPlugin) => {
    const n = plugin[namespace];
    // @ts-ignore
    return n ? n[props.method]() : null;
  };
  const methodResult = useTracker(props.value || defaultValueFunc);

  return (
    <div>
      <span className="text-sm font-normal font-mono">
        <DocLink namespace={namespace} method={props.method}>
          {props.method}
        </DocLink>
        :
      </span>{' '}
      <span className="text-xs">{formatResult(methodResult)}</span>
    </div>
  );
};

const DocLink = (props: { namespace: string; method: string; children: ReactNode }) => {
  const namespaceName = props.namespace.charAt(0).toUpperCase() + props.namespace.slice(1);
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={`https://plugins.remnote.com/api/classes/${namespaceName}Namespace#${props.method.toLowerCase()}`}
    >
      {props.children}
    </a>
  );
};

function isRem(obj: any) {
  // For some reason initially `instanceof Rem` was always false.
  // obj?.__proto__?.constructor?.name === 'Rem'
  // return obj && obj.__proto__ === Rem.prototype;
  return obj instanceof Rem;
}

function formatResult(result: unknown) {
  if (typeof result === 'string') {
    return result;
  }
  if (typeof result === 'undefined') {
    return <em>undefined</em>;
  }
  if (isRem(result)) {
    return `Rem(${JSON.stringify({
      // @ts-ignore
      id: result?._id,
      // @ts-ignore
      text: result?.text,
    })})`;
  }
  return JSON.stringify(result);
}

renderWidget(DevDashboard);
