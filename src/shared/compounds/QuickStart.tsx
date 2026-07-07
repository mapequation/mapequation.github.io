import { Box, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { trackEvent } from "../analytics";
import { TabbedCodeBlock } from "../components/CodeBlock";

const PYTHON_SNIPPET = `import infomap

edges = [(0, 1), (0, 2), (1, 2), (2, 3), (3, 4), (3, 5), (4, 5)]
result = infomap.run(edges)
result.modules()
# {2: 1, 0: 1, 1: 1, 3: 2, 4: 2, 5: 2}`;

const NETWORKX_SNIPPET = `import networkx as nx
import infomap

G = nx.Graph([(0, 1), (0, 2), (1, 2), (2, 3), (3, 4), (3, 5), (4, 5)])
result = infomap.run(G)
result.modules()
# {2: 1, 0: 1, 1: 1, 3: 2, 4: 2, 5: 2}`;

const IGRAPH_SNIPPET = `import igraph as ig
import infomap

G = ig.Graph([(0, 1), (0, 2), (1, 2), (2, 3), (3, 4), (3, 5), (4, 5)])
result = infomap.run(G)
result.modules()
# {2: 1, 0: 1, 1: 1, 3: 2, 4: 2, 5: 2}`;

const R_SNIPPET = `library(infomap)
edges <- data.frame(
  source = c(1, 1, 2, 3, 4, 4, 5),
  target = c(2, 3, 3, 4, 5, 6, 6)
)
result <- cluster_infomap(edges)
result$modules
# 1 2 3 4 5 6
# 1 1 1 2 2 2`;

export function QuickStart() {
  return (
    <Box w="100%" maxW="40rem">
      <TabbedCodeBlock
        ariaLabel="Quick start languages"
        files={[
          {
            language: "python",
            label: "Python",
            code: PYTHON_SNIPPET,
            value: "python",
          },
          {
            language: "python",
            label: "Python + NetworkX",
            code: NETWORKX_SNIPPET,
            value: "networkx",
          },
          {
            language: "python",
            label: "Python + igraph",
            code: IGRAPH_SNIPPET,
            value: "igraph",
          },
          { language: "r", label: "R", code: R_SNIPPET, value: "r" },
        ]}
        copyEvent="code_example_copied"
        copyProperties={(file) => ({
          site_area: "home",
          content_id: "homepage-quickstart",
          example: file.value ?? file.language,
        })}
        meta={{ wordWrap: false }}
      />
      <Link asChild fontSize="sm" mt={2}>
        <NextLink
          href="/infomap/install"
          onClick={() =>
            trackEvent("cta_clicked", {
              site_area: "home",
              cta_type: "install",
              content_id: "homepage-install-options",
            })
          }
        >
          More install options →
        </NextLink>
      </Link>
    </Box>
  );
}
