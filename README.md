# unz

A lightweight package for reading ZIP files, using native Web APIs like `ArrayBuffer` and `DecompressionStream`. It's lightweight (about 2KB compressed) and works in all modern browsers, Node, and Deno, without any dependencies.

## Usage

```javascript
import unz from "unz";

// Log the file name and the first 10 bytes of every file in the ZIP archive.
const archive = unz(await file.arrayBuffer());
for (const [fileName, archiveFile] of archive) {
	console.log(fileName, new Uint8Array(await archiveFile.arrayBuffer(), 0, 10));
}
```
