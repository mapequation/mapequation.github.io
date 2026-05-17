import { Button, type ButtonProps, Menu, Portal } from "@chakra-ui/react";
import type { FC, PropsWithChildren, ReactNode } from "react";

const MenuTrigger = Menu.Trigger as FC<
  PropsWithChildren<{ asChild?: boolean }>
>;
const MenuPositioner = Menu.Positioner as FC<PropsWithChildren>;
const MenuContent = Menu.Content as FC<PropsWithChildren>;
const MenuItem = Menu.Item as FC<
  PropsWithChildren<{ onClick?: () => void; value: string }>
>;

type WorkbenchActionMenuItem = {
  icon?: ReactNode;
  label: ReactNode;
  onSelect: () => void;
  value: string;
};

type WorkbenchActionMenuProps = {
  ariaLabel: string;
  disabled?: boolean;
  items: WorkbenchActionMenuItem[];
  loading?: boolean;
  trigger: ReactNode;
  triggerProps?: ButtonProps;
};

export function WorkbenchActionMenu({
  ariaLabel,
  disabled,
  items,
  loading,
  trigger,
  triggerProps,
}: WorkbenchActionMenuProps) {
  return (
    <Menu.Root>
      <MenuTrigger asChild>
        <Button
          aria-label={ariaLabel}
          disabled={disabled}
          loading={loading}
          size="xs"
          variant="surface"
          {...triggerProps}
        >
          {trigger}
        </Button>
      </MenuTrigger>
      <Portal>
        <MenuPositioner>
          <MenuContent>
            {items.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
                onClick={item.onSelect}
              >
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </MenuContent>
        </MenuPositioner>
      </Portal>
    </Menu.Root>
  );
}
