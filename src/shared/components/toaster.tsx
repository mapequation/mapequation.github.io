import {
  Portal,
  Stack,
  Toast,
  Toaster as ChakraToaster,
  createToaster,
} from "@chakra-ui/react";
import type { FC, PropsWithChildren, ReactNode } from "react";
export { shareUrlSavedToast } from "./toastMessages";

export const toaster = createToaster({
  max: 3,
  offsets: "16px",
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

type ToastRenderItem = {
  closable?: boolean;
  description?: ReactNode;
  title?: ReactNode;
};

// Chakra v3 toast compound types omit children, but runtime accepts them.
const ToasterRoot = ChakraToaster as FC<{
  children: (toast: ToastRenderItem) => ReactNode;
  toaster: typeof toaster;
}>;
const ToastTitle = Toast.Title as FC<PropsWithChildren>;
const ToastDescription = Toast.Description as FC<PropsWithChildren>;

export function Toaster() {
  return (
    <Portal>
      <ToasterRoot toaster={toaster}>
        {(toast) => (
          <Toast.Root
            w={{ base: "calc(100vw - 2rem)", md: "24rem" }}
            maxW="calc(100vw - 2rem)"
          >
            <Toast.Indicator />
            <Stack gap={1} flex="1" maxW="100%" minW={0}>
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </Stack>
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ToasterRoot>
    </Portal>
  );
}
