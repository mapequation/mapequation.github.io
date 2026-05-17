import { Box, chakra, type BoxProps } from "@chakra-ui/react";

type ImageThumbProps = Omit<BoxProps, "children"> & {
  src: string;
  alt: string;
  imagePosition?: string;
  imageSize?: string;
};

export function ImageThumb({
  src,
  alt,
  imagePosition = "center",
  imageSize = "cover",
  aspectRatio = "16 / 9",
  ...props
}: ImageThumbProps) {
  return (
    <Box
      aspectRatio={aspectRatio}
      borderRadius="md"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.emphasized"
      boxShadow="0 0 0 1px var(--chakra-colors-border-emphasized)"
      overflow="hidden"
      transition="box-shadow 150ms, border-color 150ms"
      _groupHover={{
        borderColor: "fg.muted",
        boxShadow: "0 0 0 1px var(--chakra-colors-fg-muted)",
      }}
      {...props}
    >
      <chakra.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        display="block"
        w="100%"
        h="100%"
        objectFit={imageSize === "contain" ? "contain" : "cover"}
        objectPosition={imagePosition}
        transform={
          imageSize !== "cover" && imageSize !== "contain"
            ? `scale(${imageSize})`
            : undefined
        }
      />
    </Box>
  );
}
