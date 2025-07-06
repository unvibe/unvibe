import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThreadInputBox } from '~/modules/project/threads/thread-input-box';
import { stringToHue } from '../system/lib/string-to-hue';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';
import { HiChevronDown } from 'react-icons/hi2';
import { useProject } from '../provider';
import { StartThreadContextModal } from './start-thread-context-modal';
import ModelsSelector from './models-selector';
import { useLLMModels } from '~/modules/root-providers/llm-models';

export function StartThreadInput({
  onSubmit,
  isPending,
  placeholder = 'Make a BMI calculator',
  initialContextConfig,
  currentModelId,
}: {
  isPending: boolean;
  placeholder?: string;
  initialContextConfig?: Record<string, boolean>;
  currentModelId?: string;
  onSubmit: (value: {
    prompt: string;
    images: string[];
    search_enabled: boolean;
    clearAttachments: () => void;
    setPrompt: (value: string) => void;
    contextConfig: Record<string, boolean>;
    model_id: string;
  }) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [showContextModal, setShowContextModal] = useState(false);
  const project = useProject();
  const models = useLLMModels();

  const colors = useMemo(() => {
    return Object.values(project.plugins)
      .filter((p) =>
        Object.keys(project.context_config).some((key) =>
          key.startsWith(`system/${p.id}/`)
        )
      )
      .slice(0, 2)
      .map((p) => `hsl(${stringToHue(p.id)}, 70%, 50%)`)
      .concat(`hsl(0, 0%, 50%)`);
  }, [project.plugins, project.context_config]);

  const [contextConfig, setContextConfig] = useState<Record<string, boolean>>(
    initialContextConfig || project.context_config
  );

  useEffect(() => {
    if (initialContextConfig) {
      setContextConfig(initialContextConfig);
    }
  }, [initialContextConfig]);

  const updateContextConfig = useCallback(
    (
      source: 'system' | 'tool' | 'hook',
      pluginId: string,
      key: string,
      value: boolean
    ) => {
      setContextConfig((prev) => ({
        ...prev,
        [`${source}/${pluginId}/${key}`]: value,
      }));
    },
    []
  );
  const [selectedModel, setSelectedModel] = useState(
    currentModelId || models.DEFAULT_MODEL.MODEL_CONFIG.id
  );

  useEffect(() => {
    setSelectedModel(currentModelId || models.DEFAULT_MODEL.MODEL_CONFIG.id);
  }, [currentModelId]);

  return (
    <>
      <ThreadInputBox
        prompt={prompt}
        setPrompt={setPrompt}
        isPending={isPending}
        disableInput={isPending}
        placeholder={placeholder}
        onSubmit={(value) => {
          onSubmit({
            ...value,
            contextConfig,
            setPrompt,
            model_id: selectedModel,
          });
        }}
      >
        <button
          className='bg-background-2 p-2 rounded-full flex items-center h-full'
          onClick={() => setShowContextModal(true)}
        >
          <span className='pr-1'>
            <TbAdjustmentsHorizontal className='w-4 h-4' />
          </span>
          <span className='flex pr-1 items-center'>
            {colors.slice(0, 3).map((color) => (
              <span
                className='w-4 h-4 rounded-full border-2 border-background-2 -mr-2'
                key={color}
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
          <span className='px-2'>
            <HiChevronDown className='w-4 h-4' />
          </span>
        </button>
        <ModelsSelector
          trigger='text-xs bg-background-2 rounded-full p-2 overflow-hidden overflow-ellipsis font-display font-normal'
          chevron='w-4 h-4 text-foreground-2'
          models={models.models}
          value={selectedModel}
          onChange={setSelectedModel}
          style={{}}
        />
      </ThreadInputBox>
      {showContextModal && (
        <StartThreadContextModal
          setShowContextModal={setShowContextModal}
          contextConfig={contextConfig}
          updateContextConfig={updateContextConfig}
        />
      )}
    </>
  );
}
