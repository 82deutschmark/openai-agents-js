import clsx from 'clsx';
import React from 'react';

type TextMessageProps = {
  text: string;
  isUser: boolean;
};

export function TextMessage({ text, isUser }: TextMessageProps) {
  return (
    <div
      className={clsx('flex w-full py-2', {
        'justify-end': isUser,
        'justify-start': !isUser,
      })}
    >
      <div
        className={clsx(
          'max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors',
          {
            'ml-6 bg-indigo-600 text-white': isUser,
            'mr-6 border border-slate-200 bg-white text-slate-800': !isUser,
          },
        )}
      >
        {text}
      </div>
    </div>
  );
}
