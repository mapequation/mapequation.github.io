import {
  Button,
  type ButtonProps,
  type DownloadableData,
  DownloadTrigger,
  Menu,
  Portal,
} from "@chakra-ui/react";
import type { FC, PropsWithChildren, ReactNode } from "react";

const MenuTrigger = Menu.Trigger as FC<
  PropsWithChildren<{ asChild?: boolean }>
>;
const MenuPositioner = Menu.Positioner as FC<PropsWithChildren>;
const MenuContent = Menu.Content as FC<PropsWithChildren>;
const MenuItem = Menu.Item as FC<
  PropsWithChildren<{ asChild?: boolean; onClick?: () => void; value: string }>
>;

type DownloadActionProps = PropsWithChildren<{
  data: DownloadableData | (() => DownloadableData | Promise<DownloadableData>);
  fileName: string;
  mimeType: string;
  onClick?: () => void;
}>;

const DownloadAction = DownloadTrigger as FC<DownloadActionProps>;

type DownloadActionData = Omit<DownloadActionProps, "children" | "onClick">;

type WorkbenchActionMenuItem = {
  download?: DownloadActionData;
  downloads?: DownloadActionData[];
  icon?: ReactNode;
  label: ReactNode;
  onSelect?: () => void;
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
  const saveFile = (
    data: DownloadableData,
    fileName: string,
    mimeType: string,
  ) => {
    const blob =
      data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const downloadFiles = (files: DownloadActionData[]) => {
    for (const file of files) {
      const data = typeof file.data === "function" ? file.data() : file.data;
      if (data instanceof Promise) {
        data.then((resolved) =>
          saveFile(resolved, file.fileName, file.mimeType),
        );
      } else {
        saveFile(data, file.fileName, file.mimeType);
      }
    }
  };

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
            {items.map((item) =>
              item.download ? (
                <MenuItem key={item.value} asChild value={item.value}>
                  <DownloadAction
                    data={item.download.data}
                    fileName={item.download.fileName}
                    mimeType={item.download.mimeType}
                    onClick={item.onSelect}
                  >
                    {item.icon}
                    {item.label}
                  </DownloadAction>
                </MenuItem>
              ) : (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  onClick={() => {
                    if (item.downloads) downloadFiles(item.downloads);
                    item.onSelect?.();
                  }}
                >
                  {item.icon}
                  {item.label}
                </MenuItem>
              ),
            )}
          </MenuContent>
        </MenuPositioner>
      </Portal>
    </Menu.Root>
  );
}
