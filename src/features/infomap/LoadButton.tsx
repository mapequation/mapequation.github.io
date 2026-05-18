import { Button, FileUpload } from "@chakra-ui/react";
import type { ComponentProps, FC, ReactNode } from "react";
import { LuUpload } from "react-icons/lu";

const FileUploadTrigger = FileUpload.Trigger as FC<
  ComponentProps<typeof FileUpload.Trigger> & {
    asChild?: boolean;
    children: ReactNode;
  }
>;

type LoadButtonProps = ComponentProps<typeof Button> & {
  children?: ReactNode;
};

export default function LoadButton({ children, ...props }: LoadButtonProps) {
  return (
    <FileUploadTrigger asChild unstyled>
      <Button variant="surface" {...props}>
        <LuUpload />
        {children}
      </Button>
    </FileUploadTrigger>
  );
}
