import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ImageThumb } from "../components/ImageThumb";

export interface AppCardProps {
  href: string;
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  imageSize?: string;
  external?: boolean;
  cta?: string;
  onClick?: () => void;
  children?: ReactNode;
}

function CardLink({
  href,
  external,
  onClick,
  children,
  ...linkProps
}: {
  href: string;
  external: boolean;
  onClick?: () => void;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "onClick" | "children">) {
  return (
    <Link asChild {...linkProps}>
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" onClick={onClick}>
          {children}
        </a>
      ) : (
        <NextLink href={href} onClick={onClick}>
          {children}
        </NextLink>
      )}
    </Link>
  );
}

export default function AppCard({
  href,
  title,
  description,
  image,
  imageAlt = "",
  imagePosition = "center",
  imageSize = "cover",
  external = true,
  cta = "Launch",
  onClick,
}: AppCardProps) {
  return (
    <Stack as="article" gap={3} bg="transparent" transition="transform 150ms">
      <CardLink
        href={href}
        external={external}
        onClick={onClick}
        _hover={{ textDecoration: "none" }}
        role="group"
        display="block"
      >
        <ImageThumb
          src={image}
          alt={imageAlt}
          imagePosition={imagePosition}
          imageSize={imageSize}
          aspectRatio="16 / 9"
        />
      </CardLink>

      <Heading as="h3" textStyle="h2" color="fg" mb={0}>
        {title}
      </Heading>

      {description && (
        <Text color="fg.muted" fontSize="sm" mb={0} lineHeight={1.55}>
          {description}
        </Text>
      )}

      <Box>
        <CardLink
          href={href}
          external={external}
          onClick={onClick}
          fontSize="sm"
          fontWeight={600}
          color="link.emphasis"
        >
          {cta} →
        </CardLink>
      </Box>
    </Stack>
  );
}
