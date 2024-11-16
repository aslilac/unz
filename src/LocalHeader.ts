import type ArchiveReader from "./ArchiveReader.js";
import LocalHeaderDescriptor from "./LocalHeaderDescriptor.js";
const LOCAL_HEADER = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

export default class LocalHeader {
	readonly signature: Uint8Array;
	readonly versionNeeded: number;
	readonly bitFlag: number;
	readonly compressionMethod: number;
	readonly modifiedTime: number;
	readonly modifiedDate: number;
	readonly crc32: number;
	readonly compressedSize: number;
	readonly uncompressedSize: number;
	readonly fileNameLength: number;
	readonly extraLength: number;
	readonly fileName: string;
	readonly extra: Uint8Array;
	readonly startOfCompressedFile: number;
	readonly endOfCompressedFile: number;
	readonly descriptor?: LocalHeaderDescriptor;

	constructor(reader: ArchiveReader, compressedDataSize: number) {
		this.signature = reader.expect(LOCAL_HEADER);
		this.versionNeeded = reader.readUint16();
		this.bitFlag = reader.readUint16();
		this.compressionMethod = reader.readUint16();
		this.modifiedTime = reader.readUint16();
		this.modifiedDate = reader.readUint16();
		this.crc32 = reader.readInt32();
		this.compressedSize = reader.readUint32();
		this.uncompressedSize = reader.readUint32();
		this.fileNameLength = reader.readUint16();
		this.extraLength = reader.readUint16();

		this.fileName = reader.readString(this.fileNameLength);
		this.extra = reader.read(this.extraLength);

		// Store the beginning and ending positions of the compressed data
		this.startOfCompressedFile = reader.position;
		// We use the compressed data size given to us from the central directory
		// listing, because it may be omitted from the local header.
		reader.position += compressedDataSize;
		this.endOfCompressedFile = reader.position;

		// Check if this file has a data descriptor after the compressed data.
		if (this.bitFlag & 8) {
			this.descriptor = new LocalHeaderDescriptor(reader);
		}
	}
}
