import CentralDirectoryListing from "./CentralDirectoryListing.js";
import { inflate } from "./deflate.js";

/**
 * A function that can be used by unz to decompress a file when extracting it
 * from an archive.
 *
 * The `centralDirectoryListing` for the file is included because certain
 * compression methods specify additional information (such as flags from the
 * `bitFlags` property) that must be used to properly decompress the buffer.
 *
 * @remarks Not to be used directly. For getting files from a ZIP archive use
 * the {@link default | unz} function.
 */
export type Decompressor = (
	buffer: ArrayBuffer,
	centralDirectoryListing: CentralDirectoryListing,
) => Promise<ArrayBuffer>;

/**
 * The ZIP format supports many compression methods. unz supports the most
 * common ones, but is contrained by the goals of keeping the code small and
 * focused, without dependencies, and while remaining highly portable. If you
 * should wish to use unz but need support for additional decompression methods,
 * you can add support yourself!
 *
 * ```typescript
 * import { type Decompressor, decompressors } from "unz";
 *
 * const bzip2Decompressor: Decompressor = ...;
 * decompressors.set(12, bzip2Decompressor);
 * const lzmaDecompressor: Decompressor = ...;
 * decompressors.set(14, lzmaDecompressor);
 * ```
 *
 * The number should match the compression method identifier as defined by
 * {@link https://pkware.cachefly.net/webdocs/APPNOTE/APPNOTE-6.3.10.TXT} in
 * section 4.4.5. The function must be a {@link Decompressor}.
 */
export const decompressors = new Map<number, Decompressor>();

// 0 - The file is stored (no compression)
decompressors.set(0, (data) => Promise.resolve(data));

// 8 - The file is Deflated
decompressors.set(8, inflate);
