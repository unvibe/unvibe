/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClientEndpointsMap } from '@/server/api/client';
import React from 'react';
/**
ToolParams is: {
  [key: string]: JSONSchema7Definition;
}
**/
type ToolParams =
  ClientEndpointsMap['GET /tools-tester/list']['output']['tools'][number]['parameters'];
type JSONSchema = any;

type RenderProps = {
  schema: JSONSchema;
  value: any;
  onChange: (v: any) => void;
  name?: string;
};

function RenderString({ value, onChange, name, schema }: RenderProps) {
  if (schema.enum) {
    return (
      <div className='w-full mb-4'>
        <label
          className='block mb-1 text-foreground font-semibold'
          htmlFor={name}
        >
          {name}
        </label>
        <select
          id={name}
          className='w-full text-foreground border border-border border-dashed rounded-lg p-3 focus:border-blue-500 focus:outline-none transition'
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value=''></option>
          {schema.enum.map((v: string) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className='w-full mb-4'>
      <label className='capitalize font-semibold px-4'>{name}</label>
      <textarea
        id={name}
        placeholder={schema.description}
        className='w-full text-foreground border border-dashed border-border rounded-lg p-3 focus:border-blue-500 focus:outline-none transition resize-none'
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function RenderNumber({ value, onChange, name, schema }: RenderProps) {
  if (schema.enum) {
    return (
      <div className='w-full mb-4'>
        <select
          id={name}
          className='w-full  text-foreground border border-border border-dashed rounded-lg p-3 focus:border-blue-500 focus:outline-none transition'
          value={value !== undefined ? String(value) : ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value))
          }
        >
          <option value=''></option>
          {schema.enum.map((v: number) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className='w-full mb-4'>
      <input
        id={name}
        type='number'
        className='w-full  text-foreground border border-border border-dashed rounded-lg p-3 focus:border-blue-500 focus:outline-none transition'
        placeholder={name}
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? undefined : Number(e.target.value))
        }
      />
    </div>
  );
}

function RenderBoolean({ value, onChange, name }: RenderProps) {
  return (
    <div className='w-full mb-4 flex items-center gap-2'>
      <input
        id={name}
        type='checkbox'
        className='accent-blue-600 w-5 h-5 border border-border border-dashed rounded focus:outline-none'
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label
        htmlFor={name}
        className='text-foreground font-semibold select-none'
      >
        {name}
      </label>
    </div>
  );
}

function RenderArray({ schema, value, onChange, name }: RenderProps) {
  // Only supports homogeneous array for demo
  const items = Array.isArray(value) ? value : [];
  const itemSchema = schema.items || { type: 'string' };
  return (
    <fieldset className='w-full mb-4 border border-dashed border-border rounded-lg py-3 px-3'>
      <legend className='text-foreground font-bold mb-2 px-2 font-mono text-sm'>
        {name}[]
      </legend>
      {items.map((item, idx) => (
        <div key={idx} className='flex items-center gap-2 mb-2 relative'>
          <RenderJSONSchemaInput
            schema={itemSchema}
            value={item}
            onChange={(v) => {
              const n = [...items];
              n[idx] = v;
              onChange(n);
            }}
            name={`item-${idx}`}
          />
          <button
            type='button'
            className='ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 absolute top-0 right-2'
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type='button'
        className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
        onClick={() =>
          onChange([
            ...items,
            itemSchema.default ?? (itemSchema.type === 'number' ? 0 : ''),
          ])
        }
      >
        Add Item
      </button>
    </fieldset>
  );
}

function RenderObject({ schema, value, onChange, name }: RenderProps) {
  const properties = schema.properties || {};
  return (
    <fieldset className='w-full mb-4 border border-dashed border-border rounded-lg px-5'>
      <legend className='text-foreground font-bold mb-2 px-2 font-mono text-sm'>
        {name}
      </legend>
      {Object.entries(properties).map(([key, propSchema]: [string, any]) => (
        <RenderJSONSchemaInput
          key={key}
          schema={propSchema}
          value={value?.[key]}
          onChange={(v) => onChange({ ...value, [key]: v })}
          name={key}
        />
      ))}
    </fieldset>
  );
}

function RenderJSONSchemaInput({ schema, value, onChange, name }: RenderProps) {
  if (!schema) return null;
  switch (schema.type) {
    case 'string':
      return (
        <RenderString
          schema={schema}
          value={value}
          onChange={onChange}
          name={name}
        />
      );
    case 'number':
    case 'integer':
      return (
        <RenderNumber
          schema={schema}
          value={value}
          onChange={onChange}
          name={name}
        />
      );
    case 'boolean':
      return (
        <RenderBoolean
          schema={schema}
          value={value}
          onChange={onChange}
          name={name}
        />
      );
    case 'array':
      return (
        <RenderArray
          schema={schema}
          value={value}
          onChange={onChange}
          name={name}
        />
      );
    case 'object':
      return (
        <RenderObject
          schema={schema}
          value={value}
          onChange={onChange}
          name={name}
        />
      );
    default:
      return (
        <div className='text-red-600'>Unsupported type: {schema.type}</div>
      );
  }
}

// Add form/setForm props and make controlled
export function ToolParametersRenderer({
  params,
  form,
  setForm,
}: {
  params: ToolParams;
  form: any;
  setForm: (f: any) => void;
}) {
  if (!params || typeof params !== 'object')
    return <div className='text-foreground'>No schema specified</div>;
  return (
    <>
      {Object.entries(params).map(([key, schema]: [string, any]) => (
        <RenderJSONSchemaInput
          key={key}
          schema={schema}
          value={form?.[key]}
          onChange={(v) => setForm((old: any) => ({ ...old, [key]: v }))}
          name={key}
        />
      ))}
    </>
  );
}
