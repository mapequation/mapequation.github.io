import { Switch } from "@chakra-ui/react";
import type { ElementType, ReactNode } from "react";

const SwitchControl = Switch.Control as ElementType;
const SwitchLabel = Switch.Label as ElementType;

type ToggleFieldProps = {
  ariaLabel: string;
  checked: boolean;
  children?: ReactNode;
  id: string;
  onChange: () => void;
};

export function ToggleField({
  ariaLabel,
  checked,
  children,
  id,
  onChange,
}: ToggleFieldProps) {
  return (
    <Switch.Root
      checked={checked}
      colorPalette="blue"
      gap={2}
      id={id}
      onCheckedChange={onChange}
      size="sm"
    >
      <Switch.HiddenInput aria-label={ariaLabel} />
      <SwitchControl>
        <Switch.Thumb />
      </SwitchControl>
      {children && (
        <SwitchLabel color="fg.muted" fontSize="xs" fontWeight={700}>
          {children}
        </SwitchLabel>
      )}
    </Switch.Root>
  );
}
