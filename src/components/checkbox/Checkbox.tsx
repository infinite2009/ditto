import React from "react";
import { twMerge } from "tailwind-merge";

interface CheckBoxProps {
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  indeterminate?: boolean;
}

export function CheckBox({
  label,
  checked,
  onChange,
  className,
  indeterminate,
}: CheckBoxProps) {
  return (
    <div className={twMerge("flex items-center", className)}>
      <input
        className={twMerge(
          "m-3 flex-shrink-0 border border-line-bold rounded-sm bg-white cursor-pointer",
          indeterminate && checked !== true && "opacity-30"
        )}
        type="checkbox"
        checked={checked || indeterminate}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {label}
    </div>
  );
}
