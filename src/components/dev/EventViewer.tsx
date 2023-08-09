import { AppEvent, useAPIEventListener, usePlugin } from '@remnote/plugin-sdk';
import { useState } from 'react';
import Button from '../builtin/button';

interface EventLogEntry {
  eventType: AppEvent;
  timestamp: Date;
  args: any;
}

export function EventViewer(props: { event: AppEvent }) {
  const plugin = usePlugin();
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // app.stealKeys uses plugin id as listener key
  useAPIEventListener(props.event, plugin.id, (args) => {
    if (!enabled) return;
    console.log('Event:', props.event, 'Args:', args);
    setEvents((events) =>
      events.concat({
        args,
        timestamp: new Date(),
        eventType: props.event,
      })
    );
  });

  return (
    <>
      <h3>
        {props.event}
        <Button onClick={() => setEvents([])}>Clear</Button>
      </h3>
      {enabled && (
        <>
          {events.length > 20 && !showAll && (
            <button onClick={() => setShowAll(true)}>Show All</button>
          )}
          {events.length > 20 && showAll && (
            <button onClick={() => setShowAll(false)}>Show Last 20</button>
          )}
          <ul>
            {events.slice(showAll ? 0 : Math.max(0, events.length - 20)).map((e, i) => (
              <li key={i}>
                {e.timestamp.toTimeString().slice(0, 8)}:{' '}
                <span className="font-mono">{JSON.stringify(e.args)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
