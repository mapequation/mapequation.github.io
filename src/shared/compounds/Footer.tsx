import {
  Box,
  Container,
  chakra,
  Flex,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { trackEvent } from "../analytics";
import EmailLink from "../components/EmailLink";
import Logo from "../components/Logo";
import { INFOMAP_PYTHON_DOCS_URL, INFOMAP_R_DOCS_URL } from "../docsUrls";
import { PortalEyebrow } from "./portal";

const linkStyles = {
  color: "gray.700",
  fontSize: "sm",
  textDecoration: "none",
  _hover: { color: "link.emphasis" },
};

const FootLink = ({
  href,
  external,
  eventId,
  children,
}: {
  href: string;
  external?: boolean;
  eventId?: string;
  children: React.ReactNode;
}) =>
  external ? (
    <chakra.a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        trackEvent("outbound_clicked", {
          site_area: "home",
          content_id: eventId ?? "footer-external",
          destination: href,
        })
      }
      {...linkStyles}
    >
      {children}
    </chakra.a>
  ) : (
    <Box asChild {...linkStyles}>
      <NextLink
        href={href}
        onClick={() =>
          trackEvent("cta_clicked", {
            site_area: "home",
            cta_type: href === "/publications" ? "cite" : "docs",
            content_id: eventId ?? `footer-${href.replace("/", "") || "home"}`,
          })
        }
      >
        {children}
      </NextLink>
    </Box>
  );

export default function Footer() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderTopColor="gray.200"
      bg="white"
      pt={10}
      pb={7}
      mt={16}
    >
      <Container>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 4 }}
          gap={8}
          alignItems="start"
        >
          <Box>
            <Logo size={36} />
            <Text fontSize="sm" color="gray.600" maxW="34ch" mt={4} mb={0}>
              A research framework for understanding flows on networks.
            </Text>
          </Box>
          <Box>
            <PortalEyebrow>Software</PortalEyebrow>
            <Stack gap={2}>
              <FootLink href="/infomap" eventId="footer-infomap">
                Infomap
              </FootLink>
              <FootLink href="/apps" eventId="footer-apps">
                Apps &amp; Notebooks
              </FootLink>
            </Stack>
          </Box>
          <Box>
            <PortalEyebrow>Research</PortalEyebrow>
            <Stack gap={2}>
              <FootLink href="/publications" eventId="footer-publications">
                Publications
              </FootLink>
              <FootLink href="/about" eventId="footer-about">
                About
              </FootLink>
            </Stack>
          </Box>
          <Box>
            <PortalEyebrow>Packages</PortalEyebrow>
            <Stack gap={2}>
              <FootLink
                href="https://github.com/mapequation/infomap"
                external
                eventId="footer-github"
              >
                GitHub ↗
              </FootLink>
              <FootLink
                href={INFOMAP_PYTHON_DOCS_URL}
                external
                eventId="footer-python-docs"
              >
                Python API docs ↗
              </FootLink>
              <FootLink
                href={INFOMAP_R_DOCS_URL}
                external
                eventId="footer-r-universe"
              >
                R-universe ↗
              </FootLink>
            </Stack>
          </Box>
        </SimpleGrid>
        <Flex
          mt={8}
          pt={5}
          borderTopWidth="1px"
          borderTopColor="gray.200"
          justify="space-between"
          color="gray.500"
          fontSize="xs"
          flexWrap="wrap"
          gap={2}
        >
          <Text mb={0}>
            © 2008–{new Date().getFullYear()} mapequation.org{" · "}
            <NextLink href="/about#Terms" passHref>
              Terms
            </NextLink>
          </Text>
          <Text mb={0}>
            <EmailLink
              user="martin.rosvall"
              domain="umu.se"
              color="gray.500"
              textDecoration="none"
              _hover={{ color: "link.emphasis" }}
            />
            {" · "}
            Made at Umeå University
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
