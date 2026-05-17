import { Button, type ButtonProps } from "@chakra-ui/react";

type WorkbenchChipProps = ButtonProps & {
  selected?: boolean;
};

export function WorkbenchChip({
  children,
  selected,
  ...props
}: WorkbenchChipProps) {
  return (
    <Button
      bg={selected ? "blue.50" : "bg.subtle"}
      borderColor={selected ? "blue.400" : "border"}
      color={selected ? "blue.800" : undefined}
      justifyContent="flex-start"
      px={2}
      shadow={selected ? "md" : undefined}
      size="xs"
      type="button"
      variant="outline"
      whiteSpace="nowrap"
      w="auto"
      _hover={{
        bg: "bg.panel",
        borderColor: selected ? "blue.500" : "border.emphasized",
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
