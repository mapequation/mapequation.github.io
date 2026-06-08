import {
  Box,
  Button,
  Container,
  chakra,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { GetStaticProps, NextPage } from "next";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { trackEvent } from "../shared/analytics";
import { ImageThumb } from "../shared/components/ImageThumb";
import { PrimaryButton } from "../shared/components/PrimaryButton";
import { SeoHead } from "../shared/components/SeoHead";
import FlowDemo from "../shared/compounds/FlowDemo";
import NewsList from "../shared/compounds/NewsList";
import { PortalSection } from "../shared/compounds/portal";
import { QuickStart } from "../shared/compounds/QuickStart";
import { loadNews, type NewsItem } from "../shared/loadNews";

const PORTAL_CARDS = [
  {
    href: "/infomap",
    title: "Infomap",
    description:
      "Install the reference implementation or test a network in your browser.",
    image: "/apps/Infomap.png",
    imagePosition: "center top",
    imageSize: undefined,
    ctaType: "infomap",
    contentId: "portal-infomap",
  },
  {
    href: "/apps",
    title: "Apps & Notebooks",
    description:
      "Inspect partitions, hierarchies, alluvial changes, notebooks, and bioregions.",
    image: "/apps/NewAlluvialGenerator.png",
    imagePosition: "bottom left",
    imageSize: undefined,
    ctaType: "docs",
    contentId: "portal-apps-notebooks",
  },
  {
    href: "/publications",
    title: "Publications",
    description:
      "Find method papers, software citations, surveys, and examples to cite.",
    image:
      "/publications/Rosvall-Bergstrom-2008-Maps-of-information-flow/science2004.svg",
    imagePosition: "bottom right",
    imageSize: "120%",
    ctaType: "cite",
    contentId: "portal-publications",
  },
] as const;

interface Props {
  recentNews: NewsItem[];
}

const QUOTE = {
  q: "The best maps convey a great deal of information but require minimal bandwidth: the best maps are also good compressions.",
  by: "M. Rosvall and C. T. Bergstrom, PNAS 105, 1118 (2008)",
};

const HomePage: NextPage<Props> = ({ recentNews }) => {
  return (
    <>
      <SeoHead
        title="MapEquation — flow-based community detection with Infomap"
        description="Use the map equation framework and Infomap to detect multilevel communities in directed, weighted, multilayer, bipartite, and memory networks."
        path="/"
      />
      <Container>
        {/* Hero — brand level */}
        <SimpleGrid
          as="section"
          columns={{ base: 1, lg: 2 }}
          gap={{ base: 8, lg: 12 }}
          alignItems="center"
          mt={{ base: 8, md: 12 }}
        >
          <Stack align="flex-start" gap={5}>
            <Heading as="h1" textStyle="h1">
              Find flow-based communities in complex networks
            </Heading>
            <Text color="gray.700" textStyle="body" mb={0}>
              Use the map equation framework and Infomap to model how flow moves
              through your network and detect multilevel communities in
              directed, weighted, multilayer, bipartite, and memory networks.
            </Text>
            <Flex gap={3} flexWrap="wrap" mt={1}>
              <PrimaryButton
                href="/infomap/workbench"
                onClick={() =>
                  trackEvent("cta_clicked", {
                    site_area: "home",
                    cta_type: "infomap",
                    content_id: "hero-workbench",
                  })
                }
              >
                Try Infomap in your browser <LuArrowRight />
              </PrimaryButton>
              <Button asChild size="lg" variant="surface">
                <NextLink
                  href="/infomap/install"
                  onClick={() =>
                    trackEvent("cta_clicked", {
                      site_area: "home",
                      cta_type: "install",
                      content_id: "hero-install",
                    })
                  }
                >
                  Install Infomap <LuArrowRight />
                </NextLink>
              </Button>
            </Flex>
            <QuickStart />
            <Text color="gray.600" textStyle="body" mb={0}>
              Since 2008, the framework has grown from a random-walk coding idea
              into open-source software, visualization tools, and ongoing
              research on higher-order, multilayer, and Bayesian community
              detection.
            </Text>
          </Stack>
          <Box
            my={8}
            mx="auto"
            justifySelf={{ base: "center", lg: "auto" }}
            w="100%"
          >
            <FlowDemo />
          </Box>
        </SimpleGrid>

        {/* Portal cards — three doorways */}
        <PortalSection eyebrow="Start here" title="Explore">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={16}>
            {PORTAL_CARDS.map((card) => (
              <NextLink
                key={card.href}
                href={card.href}
                onClick={() =>
                  trackEvent("cta_clicked", {
                    site_area: "home",
                    cta_type: card.ctaType,
                    content_id: card.contentId,
                  })
                }
                style={{ textDecoration: "none", display: "block" }}
              >
                <Stack role="group" gap={3} h="100%">
                  <ImageThumb
                    src={card.image}
                    alt={card.title}
                    imagePosition={card.imagePosition}
                    imageSize={card.imageSize}
                    aspectRatio="16 / 10"
                  />
                  <Heading
                    as="h3"
                    size="md"
                    color="link.emphasis"
                    _groupHover={{ color: "link.emphasisHover" }}
                    mb={0}
                  >
                    {card.title}{" "}
                    <chakra.span aria-hidden="true" fontWeight={400}>
                      »
                    </chakra.span>
                  </Heading>
                  <Text color="fg.muted" fontSize="sm" mb={0}>
                    {card.description}
                  </Text>
                </Stack>
              </NextLink>
            ))}
          </SimpleGrid>
        </PortalSection>

        {/* News */}
        <PortalSection
          eyebrow="News"
          title="Latest releases & papers"
          href="/news"
          linkText="All news"
        >
          <NewsList items={recentNews} />
        </PortalSection>

        {/* Quote */}
        <Box
          as="section"
          textAlign="center"
          my={{ base: 12, md: 16 }}
          maxW="48rem"
          mx="auto"
        >
          <Text
            fontFamily="Philosopher, serif"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight={400}
            lineHeight={1.4}
            color="gray.800"
          >
            “{QUOTE.q}”
          </Text>
          <Text color="gray.500" fontSize="sm" mt={3}>
            {QUOTE.by}
          </Text>
        </Box>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { recentNews: loadNews().slice(0, 5) },
});

export default HomePage;
