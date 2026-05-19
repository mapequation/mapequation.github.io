import type { Result } from "@mapequation/infomap";
import {
  errorGraph,
  type PreviewGraph,
  parseInfomapPreviewResult,
} from "./parseInfomapPreview";

type PreviewParserRequest = {
  result: Result;
};

type PreviewParserResponse = {
  graph: PreviewGraph;
};

const worker = self as unknown as {
  onmessage: ((event: MessageEvent<PreviewParserRequest>) => void) | null;
  postMessage: (message: PreviewParserResponse) => void;
};

worker.onmessage = ({ data }: MessageEvent<PreviewParserRequest>) => {
  try {
    worker.postMessage({
      graph: parseInfomapPreviewResult(data.result),
    } satisfies PreviewParserResponse);
  } catch (error) {
    worker.postMessage({
      graph: errorGraph(
        error instanceof Error ? error.message : "Failed to parse preview.",
      ),
    } satisfies PreviewParserResponse);
  }
};
