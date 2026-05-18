import { Box, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { TabbedCodeBlock } from "../components/CodeBlock";

const PYTHON_SNIPPET = `import networkx as nx
from infomap import find_communities

G = nx.Graph([(1, 2), (1, 3), (2, 3), (3, 4), (4, 5), (4, 6), (5, 6)])
communities = find_communities(G)
# [{1, 2, 3}, {4, 5, 6}]`;

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
          { language: "python", label: "Python", code: PYTHON_SNIPPET },
          { language: "r", label: "R", code: R_SNIPPET },
        ]}
        meta={{ wordWrap: false }}
      />
      <Link asChild fontSize="sm" mt={2}>
        <NextLink href="/infomap/install">More install options →</NextLink>
      </Link>
    </Box>
  );
}
