import { useMemo } from "react";
import { CheckBox } from "./Checkbox";
import { twMerge } from "tailwind-merge";

export interface CheckboxGroupOption {
  label: string;
  value: string;
}

export interface CheckboxGroupPanelProps {
  title: string;
  description?: string;
  options: CheckboxGroupOption[];
  onChange?: (value: string[]) => void;
  value: string[];
}

export function CheckboxGroupPanel({
  title,
  description,
  options,
  onChange,
  value = [],
}: CheckboxGroupPanelProps) {
  const optionNodes = useMemo(
    () =>
      options.map((option) => (
        <CheckBox
          key={option.value}
          className="py-3"
          checked={value.includes(option.value)}
          onChange={(checked) => {
            if (checked) {
              onChange?.(value.concat(option.value));
            } else {
              onChange?.(value.filter((v) => v !== option.value));
            }
          }}
          label={
            <span className="text-[13px] leading-20 font-normal text-ellipsis overflow-hidden whitespace-nowrap">
              {option.label}
            </span>
          }
        />
      )),
    [value, options, onChange]
  );
  const indeterminate = value.length > 0 && value.length < options.length;
  return (
    <div
      className={twMerge(
        "bg-[var(--color-bg-bright)] p-12  rounded-md",
        "grid grid-cols-2 gap-y-12"
      )}
    >
      <CheckBox
        checked={value.length === options.length}
        indeterminate={indeterminate}
        onChange={(checked) => {
          if (checked || indeterminate) {
            onChange?.(options.map((option) => option.value));
          } else {
            onChange?.([]);
          }
        }}
        label={
          <>
            <span className="text-[13px] leading-20 font-medium">{title}</span>
            {description && (
              <span className="leading-20 font-normal text-xs/16 text-symbol-medium before:content-['('] after:content-[')']">
                {description}
              </span>
            )}
          </>
        }
      />
      <div />
      {optionNodes}
    </div>
  );
}
