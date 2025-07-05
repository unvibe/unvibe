import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, ...props }) => {
  return (
    <div className='flex flex-col w-full'>
      {label && <label className='mb-1 text-gray-700 font-semibold'>{label}</label>}
      <input
        type='text'
        className='border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring focus:ring-blue-200 transition w-full'
        {...props}
      />
    </div>
  );
};

export default TextInput;
