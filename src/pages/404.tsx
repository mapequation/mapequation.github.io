import {
  Container,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { PrimaryButton } from "../shared/components/PrimaryButton";
import { PortalEyebrow } from "../shared/compounds/portal";

const NotFoundPage: NextPage = () => (
  <>
    <Head>
      <title>Page not found — MapEquation</title>
    </Head>
    <Container>
      <Stack
        minH={{ base: "50dvh", md: "58dvh" }}
        justify="center"
        align="flex-start"
        py={{ base: 14, md: 20 }}
        gap={5}
      >
        <PortalEyebrow>404</PortalEyebrow>
        <Heading as="h1" textStyle="h1" maxW="17ch">
          Page not found
        </Heading>
        <Text color="gray.700" textStyle="body" maxW="40rem">
          The page may have moved, or the address may be incomplete.
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <PrimaryButton href="/">Go to start</PrimaryButton>
          <Link asChild fontSize="sm" fontWeight={600}>
            <NextLink href="/infomap">
              Browse Infomap <LuArrowRight />
            </NextLink>
          </Link>
        </HStack>
      </Stack>
    </Container>
  </>
);

export default NotFoundPage;
