import type { InputFile, InputName } from "../../state/types";

const MAX_URL_INPUT_LENGTH = 200_000;
const SHARE_PARAM = "s";
const SHARE_VERSION = 1;

export type UrlInputName =
  | Extract<InputName, "network">
  | "clusterData"
  | "metaData";

export class ShareUrlTooLongError extends Error {
  constructor() {
    super("Share URL is too long for the current inputs.");
    this.name = "ShareUrlTooLongError";
  }
}

export type WorkbenchUrlState = {
  args?: string;
  network?: InputFile;
  clusterData?: InputFile;
  metaData?: InputFile;
  oversized: UrlInputName[];
};

type WorkbenchShareState = {
  args: string;
  network: InputFile;
  clusterData: InputFile;
  metaData: InputFile;
};

type WorkbenchSharePayload = {
  args?: string;
  clusterData?: InputFile;
  metaData?: InputFile;
  network?: InputFile;
  v: typeof SHARE_VERSION;
};

const inputParams = [
  { key: "network", nameKey: "networkName" },
  { key: "clusterData", nameKey: "clusterName" },
  { key: "metaData", nameKey: "metaName" },
] satisfies { key: UrlInputName; nameKey: string }[];

const cleanParam = (params: URLSearchParams, key: string) => {
  const value = params.get(key);
  if (value === null) return undefined;
  return value.trim() ? value : undefined;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
type ByteTransform = ReadableWritablePair<Uint8Array, Uint8Array>;

async function streamToBytes(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const bytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

function bytesToStream(bytes: Uint8Array) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

async function compressText(value: string) {
  const compression = new CompressionStream(
    "deflate",
  ) as unknown as ByteTransform;
  const stream = bytesToStream(textEncoder.encode(value)).pipeThrough(
    compression,
  );
  return streamToBytes(stream);
}

async function decompressText(bytes: Uint8Array) {
  const decompression = new DecompressionStream(
    "deflate",
  ) as unknown as ByteTransform;
  const stream = bytesToStream(bytes).pipeThrough(decompression);
  return textDecoder.decode(await streamToBytes(stream));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function payloadToState(payload: unknown): WorkbenchUrlState | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const source = payload as Partial<WorkbenchSharePayload>;
  if (source.v !== SHARE_VERSION) return undefined;

  const state: WorkbenchUrlState = { oversized: [] };
  if (typeof source.args === "string" && source.args.trim()) {
    state.args = source.args;
  }

  for (const { key } of inputParams) {
    const input = source[key];
    if (!input?.value.trim()) continue;
    if (input.value.length > MAX_URL_INPUT_LENGTH) {
      state.oversized.push(key);
      continue;
    }
    state[key] = {
      name: typeof input.name === "string" ? input.name : "",
      value: input.value,
    };
  }

  return state;
}

async function parseCompressedState(value: string) {
  try {
    const json = await decompressText(base64UrlToBytes(value));
    return payloadToState(JSON.parse(json));
  } catch {
    return undefined;
  }
}

function parseLegacyState(params: URLSearchParams): WorkbenchUrlState {
  const state: WorkbenchUrlState = { oversized: [] };
  const args = cleanParam(params, "args");
  if (args) {
    state.args = args;
  }

  for (const { key, nameKey } of inputParams) {
    const value = cleanParam(params, key);
    if (!value) continue;

    if (value.length > MAX_URL_INPUT_LENGTH) {
      state.oversized.push(key);
      continue;
    }

    state[key] = {
      name: params.get(nameKey)?.trim() ?? "",
      value,
    };
  }

  return state;
}

export async function parseWorkbenchUrlState(
  params: URLSearchParams,
): Promise<WorkbenchUrlState> {
  const compressed = cleanParam(params, SHARE_PARAM);
  if (compressed) {
    const state = await parseCompressedState(compressed);
    if (state) return state;
  }

  return parseLegacyState(params);
}

export async function parseWorkbenchLocationState(
  search: string,
  hash: string,
) {
  const hashParams = new URLSearchParams(
    hash.startsWith("#") ? hash.slice(1) : hash,
  );
  const compressed = cleanParam(hashParams, SHARE_PARAM);
  if (compressed) {
    const state = await parseCompressedState(compressed);
    if (state) return state;
  }

  return parseWorkbenchUrlState(new URLSearchParams(search));
}

export async function buildWorkbenchUrl(
  baseUrl: string,
  state: WorkbenchShareState,
) {
  const url = new URL(baseUrl);
  const params = new URLSearchParams();
  const payload: WorkbenchSharePayload = { v: SHARE_VERSION };

  for (const { key } of inputParams) {
    const input = state[key];
    if (!input.value.trim()) continue;
    // Opening the link would skip this input, so refuse instead of sharing a
    // link without it.
    if (input.value.length > MAX_URL_INPUT_LENGTH) {
      throw new ShareUrlTooLongError();
    }
    payload[key] = input;
  }

  if (state.args.trim()) {
    payload.args = state.args;
  }

  params.set(
    SHARE_PARAM,
    bytesToBase64Url(await compressText(JSON.stringify(payload))),
  );

  // The fragment never reaches a server, so only the input size limit applies.
  url.search = "";
  url.hash = params.toString();
  return url.toString();
}
