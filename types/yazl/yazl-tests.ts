import { ZipFile } from "yazl";
import fs = require("fs");

const zipfile = new ZipFile();
zipfile.addFile("file1.txt", "file1.txt");
// (add only files, not directories)
zipfile.addFile("path/to/file.txt", "path/in/zipfile.txt");
// pipe() can be called any time after the constructor
// $ExpectType ReadableStream
zipfile.outputStream;

// $ExpectType ZipFile
zipfile.on("error", (err) => {
    console.error("error", err);
});

zipfile.outputStream.pipe(fs.createWriteStream("output.zip")).on("close", () => {
    console.log("done");
});
// alternate apis for adding files:
zipfile.addReadStream(process.stdin, "stdin.txt", {
    mtime: new Date(),
    mode: parseInt("0100664", 8), // -rw-rw-r--
});
zipfile.addReadStreamLazy("stdin.txt", cb => cb(null, process.stdin));
zipfile.addReadStreamLazy("stdin.txt", {
    mtime: new Date(),
    mode: parseInt("0100664", 8), // -rw-rw-r--
}, cb => cb({}, process.stdin));

zipfile.addBuffer(new Buffer("hello"), "hello.txt", {
    mtime: new Date(),
    mode: parseInt("0100664", 8), // -rw-rw-r--
});
// call end() after all the files have been added
zipfile.end();
