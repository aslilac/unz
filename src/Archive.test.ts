import * as fs from "node:fs/promises";
import * as path from "node:path";
import { expect, test } from "vitest";
import Archive from "./Archive.js";

const exampleArchives = [
	"__testdata__/example1.zip",
	"__testdata__/example2.zip",
];

test.each(exampleArchives)(
	"Real archives are parsed properly (%s)",
	async (example) => {
		const buffer = await fs.readFile(path.join(__dirname, example));
		const archive = new Archive(buffer);
		const names = [...archive.files()].map((it) => it.fileName);
		expect(names).toMatchSnapshot();
		const actualSizes = await Promise.all(
			[...archive.files()].map((it) =>
				it.arrayBuffer().then((it) => it.byteLength),
			),
		);
		expect(actualSizes).toMatchSnapshot();
		const sizes = [...archive.files()].map((it) => it.byteLength);
		expect(sizes).toEqual(actualSizes);
		const timestamps = [...archive.files()].map((it) =>
			it.lastModified.toLocaleString(),
		);
		expect(timestamps).toMatchSnapshot();
	},
);
