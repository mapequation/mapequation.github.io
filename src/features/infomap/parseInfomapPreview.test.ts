import type { Result } from "@mapequation/infomap";
import { describe, expect, it } from "vitest";
import { parseInfomapPreviewResult } from "./parseInfomapPreview";

function previewResult(result: Record<string, unknown>) {
  return parseInfomapPreviewResult(result as Result);
}

describe("parseInfomapPreviewResult", () => {
  it("returns an empty graph when Infomap output has no nodes", () => {
    const graph = previewResult({ json: { nodes: [] } });

    expect(graph).toMatchObject({
      status: "empty",
      message: "Infomap returned no nodes.",
      nodes: [],
      links: [],
    });
  });

  it("aggregates duplicate physical nodes and undirected links", () => {
    const graph = previewResult({
      flow: ["*edges", "1 2 3 0.1", "2 1 4 0.2", "2 3 5 0.3", ""].join("\n"),
      json: {
        codelength: 1.23,
        numLevels: 2,
        nodes: [
          { id: 1, name: "One", flow: 0.2, path: [1, 1] },
          { id: 1, name: "One duplicate", flow: 0.3, path: [1, 1] },
          { id: 2, name: "Two", flow: 0.4, path: [1, 2] },
          { id: 3, name: "Three", flow: 0.1, path: [2, 3] },
        ],
      },
    });

    expect(graph.status).toBe("ok");
    if (graph.status !== "ok") return;

    expect(graph.nodes).toHaveLength(3);
    expect(graph.nodes.find((node) => node.id === "1")).toMatchObject({
      degree: 1,
      flow: 0.5,
      label: "One",
    });
    expect(graph.links).toEqual([
      {
        directed: false,
        flow: 0.30000000000000004,
        source: "1",
        target: "2",
        weight: 7,
      },
      {
        directed: false,
        flow: 0.3,
        source: "2",
        target: "3",
        weight: 5,
      },
    ]);
    expect(graph.numLevels).toBe(2);
    expect(graph.oneLevelCodeLength).toBe(1.23);
  });

  it("parses CRLF directed arcs without merging reverse links", () => {
    const graph = previewResult({
      flow: "*arcs\r\n1 2 3 0.1\r\n2 1 4 0.2\r\n",
      json: {
        nodes: [
          { id: 1, flow: 0.5 },
          { id: 2, flow: 0.5 },
        ],
      },
    });

    expect(graph.status).toBe("ok");
    if (graph.status !== "ok") return;

    expect(graph.links).toEqual([
      {
        directed: true,
        flow: 0.1,
        source: "1",
        target: "2",
        weight: 3,
      },
      {
        directed: true,
        flow: 0.2,
        source: "2",
        target: "1",
        weight: 4,
      },
    ]);
    expect(graph.nodes.map((node) => node.degree)).toEqual([2, 2]);
  });

  it("maps state links to physical links", () => {
    const graph = previewResult({
      flow_as_physical: "*links\n101 202 1 0.2\n101 303 2 0.3",
      json_states: {
        nodes: [
          { id: 1, stateId: 101, flow: 0.4 },
          { id: 2, stateId: 202, flow: 0.3 },
          { id: 2, stateId: 303, flow: 0.3 },
        ],
      },
    });

    expect(graph.status).toBe("ok");
    if (graph.status !== "ok") return;

    expect(graph.isStateNetwork).toBe(true);
    expect(graph.nodes).toEqual([
      { degree: 1, flow: 0.4, id: "1", label: "1", path: undefined },
      { degree: 1, flow: 0.6, id: "2", label: "2", path: undefined },
    ]);
    expect(graph.links).toEqual([
      {
        directed: true,
        flow: 0.5,
        source: "1",
        target: "2",
        weight: 3,
      },
    ]);
  });
});
