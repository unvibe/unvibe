import { useProject } from '../provider';
import { ContextSectionCard, ContextSectionCardAdd } from './list-card';
import { Section } from './list-section';
import { ContextItemDetailsHook } from './plugins-hooks';
import { ContextItemDetailsSystem } from './plugins-system';
import { ContextItemDetailsTool } from './plugins-tools';
import { parseContext } from './utils';
import { useState } from 'react';
import { SystemAddModal } from './system-add-modal';
import { getQueryKey } from '@/server/api/client';

export function PluginList() {
  const contextPreview = useProject().context_preview;
  const parsed = parseContext(contextPreview);
  const _tools = parsed.filter((item) => item.type === 'tool');
  const _systems = parsed.filter((item) => item.type === 'system');
  const _hooks = parsed.filter((item) => item.type === 'hook');

  const [isSystemAddOpen, setIsSystemAddOpen] = useState(false);
  // Use getQueryKey for the context fetch
  const contextQueryKey = getQueryKey('GET /projects/parse-project');

  return (
    <main className='p-8 max-w-6xl mx-auto'>
      <div className='gap-8 grid content-start'>
        <Section title='Tools' description='LLM tools'>
          {_tools.map((tool) => {
            return (
              <ContextSectionCard
                key={tool._key}
                data={tool}
                ViewModal={<ContextItemDetailsTool data={tool} />}
              />
            );
          })}
          <ContextSectionCardAdd />
        </Section>
        <Section title='System' description='LLM system instructions'>
          {_systems?.map((system) => {
            return (
              <ContextSectionCard
                key={system._key}
                data={system}
                ViewModal={
                  <ContextItemDetailsSystem
                    data={system}
                    queryKeyToRefetch={contextQueryKey}
                    onRemove={() => setIsSystemAddOpen(false)}
                  />
                }
              />
            );
          })}
          <ContextSectionCardAdd onClick={() => setIsSystemAddOpen(true)} />
          <SystemAddModal
            open={isSystemAddOpen}
            onClose={() => setIsSystemAddOpen(false)}
            queryKeyToRefetch={contextQueryKey}
          />
        </Section>
        <Section title='Hooks' description='LLM structured output hooks'>
          {_hooks.map((hook) => {
            return (
              <ContextSectionCard
                key={hook._key}
                data={hook}
                ViewModal={<ContextItemDetailsHook data={hook} />}
              />
            );
          })}
        </Section>
      </div>
    </main>
  );
}
