const decoder = new TextDecoder();

export default class ArchiveReader {
	readonly #buffer: ArrayBuffer;
	#position: number;

	get position() {
		return this.#position;
	}
	set position(it) {
		if (it > this.#buffer.byteLength) {
			throw new RangeError("cannot read past end of buffer");
		}
		this.#position = it;
	}

	constructor(
		readonly buffer: ArrayBuffer,
		position = 0,
	) {
		if (!(buffer instanceof ArrayBuffer)) {
			throw new TypeError("ArchiveReader expects an ArrayBuffer");
		}

		this.#buffer = buffer;
		this.#position = position;
	}

	clone(position = this.#position): ArchiveReader {
		return new ArchiveReader(this.#buffer, position);
	}

	findNext(data: Uint8Array): boolean {
		const view = new Uint8Array(this.#buffer, this.position);

		let foundAt = -1;
		find: for (let i = 0; i < view.length - data.length; i++) {
			for (let j = 0; j < data.length; j++) {
				if (view[i + j] !== data[j]) {
					continue find;
				}
			}

			foundAt = i;
			break;
		}

		if (foundAt > 0) {
			this.position += foundAt;
			return true;
		}

		return false;
	}

	read(length: number): Uint8Array {
		const view = new Uint8Array(this.#buffer, this.position, length);
		this.position += length;
		return view;
	}

	expect(data: Uint8Array): Uint8Array {
		const view = new Uint8Array(this.#buffer, this.position, data.length);

		for (let i = 0; i < data.length; i++) {
			if (view[i] !== data[i]) {
				throw new Error(`unexpected data at 0x${this.position.toString(16)}`);
			}
		}

		this.position += data.length;
		return view;
	}

	expectMaybe(data: Uint8Array): Uint8Array | undefined {
		const view = new Uint8Array(this.#buffer, this.position, data.length);

		for (let i = 0; i < data.length; i++) {
			if (view[i] !== data[i]) {
				return undefined;
			}
		}

		this.position += data.length;
		return view;
	}

	readUint16(): number {
		const dv = new DataView(this.#buffer, this.position);
		this.position += 2;
		return dv.getUint16(0, true);
	}

	readUint32(): number {
		const dv = new DataView(this.#buffer, this.position);
		this.position += 4;
		return dv.getUint32(0, true);
	}

	readInt32(): number {
		const dv = new DataView(this.#buffer, this.position);
		this.position += 4;
		return dv.getInt32(0, true);
	}

	readString(length: number): string {
		const data = new Uint8Array(this.#buffer, this.position, length);
		this.position += length;
		return decoder.decode(data);
	}
}
