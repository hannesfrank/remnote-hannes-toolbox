import { AppEvents, RNPlugin, renderWidget, usePlugin, useTracker } from '@remnote/plugin-sdk';
import { ReactNode, createContext, useContext, useState } from 'react';
import { EventViewer } from '../components/dev/EventViewer';
import RemNoteCSSProps from '../components/dev/RemNoteCSSProps';
import '../style.css';
import { H1, H2, H3 } from '../components/typography';
import { RemViewer } from '../components/dev/RemViewer';
import { formatValue } from '../util/dev_util';
import Button from '../components/builtin/Button';

/**
 *
 * The goal of this widget is twofold:
 * 1. Inspect frequently needed info about rem.
 * 2. Help a plugin developer discover available API methods without having him refer to the documentation.
 *
 * RemNote's API is split into namespaces. Namespace methods have the following variants:
 * - Getters: Display the value they return
 * - Functions that take no, or just simple arguments: Take inputs. They can be executed via button click.
 * - Functions with complex arguments: Just link to the docs.
 */
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
        <APIMethod method="getFocusedPortal" />
      </APINamespace>
      <APINamespace name="editor">
        <APIMethod method="getFocusedEditorText" />
        <APIMethod method="getSelection" />
      </APINamespace>
      <H2>Inspect Rem</H2>
      <RemViewer remId={''} />
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

const APINamespace = (props: {
  name: keyof RNPlugin;
  children: ReactNode;
  isCollapsed?: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(props.isCollapsed);

  return (
    <APINamespaceContext.Provider value={props.name}>
      <div className="my-2">
        <H3>
          <Button onClick={() => setIsCollapsed(!isCollapsed)}>{isCollapsed ? '>' : 'v'}</Button>{' '}
          {props.name}
        </H3>
        {isCollapsed ? null : props.children}
      </div>
    </APINamespaceContext.Provider>
  );
};
APINamespace.defaultProps = { isCollapsed: true };

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
          {props.method}()
        </DocLink>
        :
      </span>{' '}
      <span className="text-xs">{formatValue(methodResult)}</span>
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

renderWidget(DevDashboard);
