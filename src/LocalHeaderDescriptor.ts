import type ArchiveReader from "./ArchiveReader.js";
const LOCAL_HEADER_DESCRIPTOR = new Uint8Array([0x50, 0x4b, 0x07, 0x08]);

export default class LocalHeaderDescriptor {
	signature: Uint8Array | undefined;
	crc32: number;
	compressedSize: number;
	uncompressedSize: number;

	constructor(reader: ArchiveReader) {
		this.signature = reader.expectMaybe(LOCAL_HEADER_DESCRIPTOR);
		this.crc32 = reader.readInt32();
		this.compressedSize = reader.readUint32();
		this.uncompressedSize = reader.readUint32();
	}
}
