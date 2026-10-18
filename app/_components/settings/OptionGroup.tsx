import { ReactNode } from "react";
import { motion } from "motion/react";

type OptionGroupProps<T extends string | number> = {
  id: string; // unique per group, names the sliding highlight
  label: string;
  icon?: ReactNode;
  options: readonly T[];
  value: T | null;
  format?: (option: T) => string;
  onChange: (option: T) => void;
  compact?: boolean; // phone layout: no icon, options share the row evenly
};

// A row of one-click choices. The highlight behind the selected option
// slides to the new one instead of jumping.
export default function OptionGroup<T extends string | number>({
  id,
  label,
  icon,
  options,
  value,
  format = String,
  onChange,
  compact = false,
}: OptionGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center">
      {icon && !compact && (
        <span aria-hidden className="px-2 text-base-content/40">
          {icon}
        </span>
      )}
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={`relative py-1.5 rounded-xl ${compact ? "flex-1 px-2" : "px-3"} whitespace-nowrap cursor-pointer transition-colors duration-200 ${
              selected ? "text-base-content" : "text-base-content/90 hover:text-base-content"
            }`}
          >
            {selected && (
              <motion.span
                layoutId={`${id}-highlight`}
                className="absolute inset-0 rounded-xl bg-base-100 shadow-sm"
              />
            )}
            <span className="relative">{format(option)}</span>
          </button>
        );
      })}
    </div>
  );
}
