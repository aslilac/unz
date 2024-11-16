import type ArchiveReader from "./ArchiveReader.js";
const END_OF_CENTRAL_DIRECTORY_HEADER = new Uint8Array([
	0x50, 0x4b, 0x05, 0x06,
]);

/**
 * EndOfCentralDirectory is the primary entrypoint that tells us where
 * everything else is located.
 */
export default class EndOfCentralDirectory {
	readonly signature: Uint8Array;
	readonly diskNumber: number;
	readonly centralDirectoryStartDisk: number;
	readonly localListingCount: number;
	readonly globalListingCount: number;
	readonly sizeOfCentralDirectory: number;
	readonly startOfCentralDirectory: number;
	readonly commentLength: number;
	readonly comment: Uint8Array;

	constructor(reader: ArchiveReader) {
		reader.findNext(END_OF_CENTRAL_DIRECTORY_HEADER);
		this.signature = reader.expect(END_OF_CENTRAL_DIRECTORY_HEADER);
		this.diskNumber = reader.readUint16();
		this.centralDirectoryStartDisk = reader.readUint16();
		this.localListingCount = reader.readUint16();
		this.globalListingCount = reader.readUint16();
		this.sizeOfCentralDirectory = reader.readUint32();
		this.startOfCentralDirectory = reader.readUint32();
		this.commentLength = reader.readUint16();
		this.comment = reader.read(this.commentLength);

		if (
			this.diskNumber !== 0 ||
			this.centralDirectoryStartDisk !== 0 ||
			this.localListingCount !== this.globalListingCount
		) {
			throw new RangeError("multi-disk zip archives are not supported");
		}
	}
}
