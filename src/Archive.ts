import ArchiveFile from "./ArchiveFile.js";
import ArchiveReader from "./ArchiveReader.js";
import CentralDirectoryListing from "./CentralDirectoryListing.js";
import EndOfCentralDirectory from "./EndOfCentralDirectory.js";

export default class Archive {
	readonly #files: Map<string, ArchiveFile> = new Map();

	constructor(it: ArrayBuffer | ArrayBufferView) {
		const buf =
			it instanceof ArrayBuffer
				? it
				: it.buffer.slice(it.byteOffset, it.byteOffset + it.byteLength);

		const reader = new ArchiveReader(buf);
		const eocd = new EndOfCentralDirectory(reader);
		reader.position = eocd.startOfCentralDirectory;

		for (let i = 0; i < eocd.globalListingCount; i++) {
			const cdl = new CentralDirectoryListing(reader);
			const file = new ArchiveFile(cdl, buf);
			this.#files.set(cdl.fileName, file);
		}

		const size = reader.position - eocd.startOfCentralDirectory;
		if (size !== eocd.sizeOfCentralDirectory) {
			throw new Error("incorrect size for central directory");
		}
	}

	[Symbol.iterator]() {
		return this.#files.entries();
	}

	files() {
		return this.#files.values();
	}

	get(name: string): ArchiveFile | undefined {
		return this.#files.get(name);
	}
}
