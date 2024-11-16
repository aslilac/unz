import CentralDirectoryListing from "./CentralDirectoryListing.js";
import { decompressors } from "./decompressors.js";
import crc32 from "./crc32.js";

const textDecoder = new TextDecoder();

/**
 * ArchiveFile represents
 * @hideconstructor
 */
export default class ArchiveFile {
	constructor(
		public readonly centralDirectoryListing: CentralDirectoryListing,
		private readonly buffer: ArrayBuffer,
	) {}

	get fileName() {
		return this.centralDirectoryListing.fileName;
	}

	get byteLength() {
		return this.centralDirectoryListing.uncompressedSize;
	}

	get compressedByteLength() {
		return this.centralDirectoryListing.compressedSize;
	}

	get lastModified() {
		const datepart = this.centralDirectoryListing.modifiedDate;
		const timepart = this.centralDirectoryListing.modifiedTime;

		const lastModified = new Date();
		lastModified.setFullYear(((datepart & 0b1111111000000000) >> 9) + 1980);
		lastModified.setMonth(((datepart & 0b0000000111100000) >> 5) - 1);
		lastModified.setDate(datepart & 0b0000000000011111);
		lastModified.setHours((timepart & 0b1111100000000000) >> 11);
		lastModified.setMinutes((timepart & 0b0000011111100000) >> 5);
		lastModified.setSeconds((timepart & 0b0000000000011111) << 1);
		lastModified.setMilliseconds(0);

		return lastModified;
	}

	async arrayBuffer(): Promise<ArrayBuffer> {
		const listing = this.centralDirectoryListing;
		const compressionMethod = listing.compressionMethod;
		const header = this.centralDirectoryListing.localHeader;
		const decompressor = decompressors.get(compressionMethod);
		if (typeof decompressor !== "function") {
			throw new Error(`unsupported compression method ${compressionMethod}`);
		}

		const compressedData = this.buffer.slice(
			header.startOfCompressedFile,
			header.endOfCompressedFile,
		);
		const uncompressedData = await decompressor(compressedData, listing);

		if (!(uncompressedData instanceof ArrayBuffer)) {
			throw new Error(`invalid result from decompressor ${compressionMethod}`);
		}
		if (uncompressedData.byteLength !== listing.uncompressedSize) {
			throw new Error(`incorrect size for file ${this.fileName}`);
		}
		if (crc32(uncompressedData) !== listing.crc32) {
			throw new Error(`incorrect checksum for file ${this.fileName}`);
		}

		return uncompressedData;
	}

	async text(): Promise<string> {
		const buffer = await this.arrayBuffer();
		return textDecoder.decode(buffer);
	}
}
