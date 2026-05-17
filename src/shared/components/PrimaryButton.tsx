import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import type { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  href: string;
}

export function PrimaryButton({ children, href }: PrimaryButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      {...{
        bg: "brand.solid",
        color: "white",
        _hover: { bg: "brand.hover" },
        _active: { bg: "brand.active" },
      }}
    >
      <NextLink href={href}>{children}</NextLink>
    </Button>
  );
}
