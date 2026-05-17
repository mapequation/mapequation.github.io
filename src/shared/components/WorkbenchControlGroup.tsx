import { ButtonGroup, type ButtonGroupProps } from "@chakra-ui/react";

export function WorkbenchControlGroup(props: ButtonGroupProps) {
  return <ButtonGroup attached size="xs" variant="surface" {...props} />;
}
