import { Tabs, type TabsRootProps } from "@chakra-ui/react";
import type { ElementType, ReactNode } from "react";

const TabsList = Tabs.List as ElementType;
const TabsTrigger = Tabs.Trigger as ElementType;

export type WorkbenchTabItem<T extends string> = {
  icon?: ReactNode;
  label: string;
  title?: string;
  value: T;
};

type WorkbenchTabsProps<T extends string> = Omit<
  TabsRootProps,
  "onValueChange" | "value"
> & {
  ariaLabel: string;
  items: WorkbenchTabItem<T>[];
  onValueChange: (value: T) => void;
  triggerHeight?: string;
  value: T;
};

export function WorkbenchTabs<T extends string>({
  ariaLabel,
  items,
  onValueChange,
  triggerHeight,
  value,
  ...props
}: WorkbenchTabsProps<T>) {
  return (
    <Tabs.Root
      value={value}
      variant="subtle"
      onValueChange={(details: { value: T }) => onValueChange(details.value)}
      {...props}
    >
      <TabsList aria-label={ariaLabel} gap={1}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            borderRadius="sm"
            color="fg.muted"
            fontSize="sm"
            fontWeight={600}
            gap={2}
            h={triggerHeight}
            px={3}
            title={item.title}
          >
            {item.icon}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs.Root>
  );
}
