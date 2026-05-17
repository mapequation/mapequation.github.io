import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
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
  children?: ReactNode;
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
}: AppCardProps) {
  return (
    <Stack as="article" gap={3} bg="transparent" transition="transform 150ms">
      <Link
        asChild
        _hover={{ textDecoration: "none" }}
        role="group"
        display="block"
      >
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          <ImageThumb
            src={image}
            alt={imageAlt}
            imagePosition={imagePosition}
            imageSize={imageSize}
            aspectRatio="16 / 9"
          />
        </a>
      </Link>

      <Heading as="h3" textStyle="h2" color="fg" mb={0}>
        {title}
      </Heading>

      {description && (
        <Text color="fg.muted" fontSize="sm" mb={0} lineHeight={1.55}>
          {description}
        </Text>
      )}

      <Box>
        <Link asChild fontSize="sm" fontWeight={600} color="link.emphasis">
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
          >
            Launch →
          </a>
        </Link>
      </Box>
    </Stack>
  );
}
