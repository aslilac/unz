import type ArchiveReader from "./ArchiveReader.js";
import LocalHeader from "./LocalHeader.js";
const CENTRAL_DIRECTORY_LISTING_HEADER = new Uint8Array([
	0x50, 0x4b, 0x01, 0x02,
]);

export default class CentralDirectoryListing {
	signature: Uint8Array;
	versionMadeBy: number;
	versionNeeded: number;
	bitFlag: number;
	compressionMethod: number;
	modifiedTime: number;
	modifiedDate: number;
	crc32: number;
	compressedSize: number;
	uncompressedSize: number;
	fileNameLength: number;
	extraLength: number;
	commentLength: number;
	fileDisk: number;
	internalAttributes: number;
	externalAttributes: number;
	fileHeaderOffset: number;
	fileName: string;
	extra: Uint8Array;
	comment: Uint8Array;

	localHeader: LocalHeader;

	constructor(reader: ArchiveReader) {
		this.signature = reader.expect(CENTRAL_DIRECTORY_LISTING_HEADER);
		this.versionMadeBy = reader.readUint16();
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
		this.commentLength = reader.readUint16();
		this.fileDisk = reader.readUint16();
		this.internalAttributes = reader.readUint16();
		this.externalAttributes = reader.readUint32();
		this.fileHeaderOffset = reader.readUint32();
		// TODO: Normalize the file names so that no one can be nefarious.
		this.fileName = reader.readString(this.fileNameLength);
		this.extra = reader.read(this.extraLength);
		this.comment = reader.read(this.commentLength);

		// Parse the corresponding local header
		this.localHeader = new LocalHeader(
			reader.clone(this.fileHeaderOffset),
			this.compressedSize,
		);

		// If the compressionMethod is "stored" then the sizes should be equal.
		if (
			this.compressionMethod === 0 &&
			this.compressedSize !== this.uncompressedSize
		) {
			throw new Error("uncompressed file has invalid size");
		}

		if (this.compressionMethod !== this.localHeader.compressionMethod) {
			throw new Error("conflicting compression method data");
		}
		if (this.fileName !== this.localHeader.fileName) {
			throw new Error("conflicting file name data");
		}
		if (this.fileDisk !== 0) {
			throw new RangeError("multi-disk zip archives are not supported");
		}

		const localInfo = this.localHeader.descriptor ?? this.localHeader;
		if (this.crc32 !== localInfo.crc32) {
			throw new Error("conflicting checksum data");
		}
		if (this.compressedSize !== localInfo.compressedSize) {
			throw new Error("conflicting compressed size data");
		}
		if (this.uncompressedSize !== localInfo.uncompressedSize) {
			throw new Error("conflicting uncompressed size data");
		}
	}
}
