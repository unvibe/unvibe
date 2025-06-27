// Improved Todo App Demo with Modular UI components
import React, { useState } from 'react';
import { Button } from '@/modules/ui/button';
import { TextInput } from '@/modules/ui/input/text';

interface Todo {
  id: number;
  text: string;
}

export default function TodoDemo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    setTodos((prev) => [...prev, { id: Date.now(), text: input.trim() }]);
    setInput('');
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <main className='max-w-lg mx-auto mt-16 px-4'>
      <div className='bg-background-1 border border-border rounded-2xl shadow-lg p-8'>
        <h1 className='text-3xl font-bold mb-6 text-center flex items-center gap-2'>
          <span role='img' aria-label='todo'>
            📝
          </span>
          Todo App Demo
        </h1>
        <form onSubmit={addTodo} className='flex gap-3 mb-6'>
          <TextInput
            placeholder='Add a todo...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='flex-1'
            aria-label='Add a todo input'
          />
          <Button
            type='submit'
            variant='primary'
            disabled={input.trim() === ''}
            className='shrink-0 h-12'
          >
            Add
          </Button>
        </form>
        <ul className='space-y-3'>
          {todos.length === 0 && (
            <li className='text-foreground-2 text-center py-4'>
              No todos yet!
            </li>
          )}
          {todos.map((todo) => (
            <li
              key={todo.id}
              className='flex items-center bg-background-2 border border-border-1 rounded-lg px-4 py-3 group transition hover:shadow-md'
            >
              <span className='flex-1 text-lg text-foreground-1'>
                {todo.text}
              </span>
              <Button
                variant='danger'
                onClick={() => removeTodo(todo.id)}
                className='opacity-70 ml-3 group-hover:opacity-100 px-3 py-2 h-auto text-lg transition'
                aria-label={`Remove ${todo.text}`}
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
