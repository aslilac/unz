# unzzz

![package version](https://img.shields.io/badge/dynamic/json?color=f0606d&label=unzzz&prefix=v&query=%24%5B%27dist-tags%27%5D.latest&url=https%3A%2F%2Fregistry.npmjs.com%2Funzzz)
![stability](https://img.shields.io/badge/stability-release-66f29a.svg)
[![build status](https://github.com/partheseas/unzzz/workflows/main/badge.svg)](https://github.com/partheseas/unzzz/actions)

A lightweight package for reading .zip files written in TypeScript.

Alternatives that exist (such as JSZip) feel overly heavy for certain use cases.
Unzzz strives to be compact, fast, and dependency free by only focusing on the
unzipping of files, rather than trying to be a swiss army knife.
It tries to be _very_ safe, accurate and validates everything possible to prevent
bad things from happening if you're using a corrupted or invalid file.

For the sake of being lightweight, it only supports DEFLATE compression by default.
The good news is that the vast majority of zip files use DEFLATE compression, and
unzzz is extensible. Adding support for additional compression methods just takes
a few lines of code! Details can be found in the documentation.

## Installation

```Shell
yarn add unzzz
```

## Usage

-   [Documentation](https://unzzz.now.sh)

```JavaScript
import unzzz from "unzzz";

unzzz(pathToArchive)
  .then((archive) => {
    // Iterate over all the files in the archive
    for (const each in archive.files) {
      // Retrieve a decompressed buffer of the file
      archive.unzipBuffer(each)
        .then((buffer) => console.log(buffer));
    }

    // Pull out specific files and save the uncompressed files to storage
    archive.unzipFile('dir/filename.ext', destination);
  });
```

**Notice:** When using CommonJS to import this module, you will need to import
the "default" property. This is not necessary when using a tool like TypeScript,
Webpack, Parcel, or Rollup.

```JavaScript
const unzzz = require("unzzz").default;
```
