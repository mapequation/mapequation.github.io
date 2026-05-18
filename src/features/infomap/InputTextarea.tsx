import { Field, Textarea } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";

type InputTextareaProps = ComponentProps<typeof Textarea> & {
  children?: ReactNode;
};

export default function InputTextarea({
  children,
  ...props
}: InputTextareaProps) {
  return (
    <Field.Root pos="relative">
      <Textarea {...props} />
      {children}
    </Field.Root>
  );
}
