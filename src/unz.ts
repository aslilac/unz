import Archive from "./Archive.js";

/**
 * unz parses ZIP files
 * @param it The `ArrayBuffer`, `Uint8Array`, or similar containing the ZIP file
 * @returns {Archive} an {@link Archive} object that files can be read from.
 */
export default function unz(it: ArrayBuffer | ArrayBufferView): Archive {
	return new Archive(it);
}
