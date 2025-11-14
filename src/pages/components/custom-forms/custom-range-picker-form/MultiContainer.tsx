import { useEffect, useState } from 'react';

export type EventArgs = any[];

interface MultiContainerProps<ValueType = string> {
  num?: number;
  render: {
    component?: (p: { value: ValueType; index: number; onChange: (...args: EventArgs) => void }) => React.ReactElement;
    label?: (index: number) => React.ReactNode;
  };
  value?: ValueType[];
  onChange?: (values: ValueType[]) => void;
}

function generateArr<T>(len: number, mapper: (i: number) => T) {
  return Array.from({ length: len }, (i, k) => mapper(k));
}


export function defaultGetValueFromEvent(valuePropName: string, ...args: EventArgs) {
  const event = args[0];
  if (event && event.target && typeof event.target === 'object' && valuePropName in event.target) {
    return (event.target as HTMLInputElement)[valuePropName];
  }

  return event;
}

function MultiContainer<ValueType = string>({ num = 2, render, value, onChange }: MultiContainerProps<ValueType>) {
  const componentMap = generateArr<ValueType>(num, () => '' as ValueType);
  const [state, setState] = useState<ValueType[]>(value ?? []);


  useEffect(() => {
    setState(value ?? []);
  }, [value]);

  return componentMap.map((_, idx) => {
    return <div
      key={idx}
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 16
      }}
    >
      <div
        style={{
          width: 60
        }}
      >
        {render.label?.(idx) ?? (idx === 0 ? '开始' : '结束')}
      </div>
      <div>
        {render.component?.({
          value: state[idx],
          index: idx,
          onChange: (...args: EventArgs) => {
            const value = defaultGetValueFromEvent('value', ...args);
            const data = [...state.slice(0, idx), value, ...state.slice(idx + 1)];
            setState(data);
            onChange?.(data);
          }
        })}
      </div>
    </div>;
  });
}

export default MultiContainer;
