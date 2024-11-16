import CentralDirectoryListing from "./CentralDirectoryListing.js";
import { decompressors } from "./decompressors.js";
import crc32 from "./crc32.js";

export default class ArchiveFile {
	fileName: string;

	constructor(
		private readonly cdl: CentralDirectoryListing,
		private readonly buf: ArrayBuffer,
	) {
		this.fileName = cdl.fileName;
	}

	async arrayBuffer(): Promise<ArrayBuffer> {
		const { compressionMethod, localHeader } = this.cdl;

		const decompressor = decompressors.get(compressionMethod);
		const compressedData = this.buf.slice(
			localHeader.startOfCompressedFile,
			localHeader.endOfCompressedFile,
		);

		if (typeof decompressor !== "function") {
			throw new Error(`unsupported compression method ${compressionMethod}`);
		}

		const uncompressedData = await decompressor(compressedData, this.cdl);

		if (!(uncompressedData instanceof ArrayBuffer)) {
			throw new Error(`invalid result from decompressor ${compressionMethod}`);
		}

		if (uncompressedData.byteLength !== this.cdl.uncompressedSize) {
			throw new Error(`incorrect size for file ${this.fileName}`);
		}

		if (crc32(uncompressedData) !== this.cdl.crc32) {
			throw new Error(`incorrect checksum for file ${this.fileName}`);
		}

		return uncompressedData;
	}
}
