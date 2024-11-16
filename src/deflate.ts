export function inflate(buf: ArrayBuffer): Promise<ArrayBuffer> {
	return useZlib() ? inflateNode(buf) : inflateWeb(buf);
}

function useZlib() {
	return (
		typeof DecompressionStream === "undefined" &&
		typeof process !== "undefined" &&
		process.versions?.node !== undefined
	);
}

async function inflateWeb(buf: ArrayBuffer): Promise<ArrayBuffer> {
	const inflateStream = new DecompressionStream("deflate-raw");
	const sourceStream = new Blob([buf]).stream();
	const inflated = sourceStream.pipeThrough(inflateStream).getReader();

	return readerToArrayBuffer(inflated);
}

async function inflateNode(buf: ArrayBuffer): Promise<ArrayBuffer> {
	const zlib = await import("node:zlib");

	return new Promise((fulfill, reject) => {
		zlib.inflateRaw(buf, (error, result) => {
			if (error) {
				reject(error);
				return;
			}

			fulfill(
				result.buffer.slice(
					result.byteOffset,
					result.byteOffset + result.byteLength,
				),
			);
		});
	});
}

async function readerToArrayBuffer(
	reader: ReadableStreamDefaultReader<ArrayBuffer>,
): Promise<ArrayBuffer> {
	const chunks = [];
	do {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	} while (true);

	const blob = new Blob(chunks);
	return blob.arrayBuffer();
}
