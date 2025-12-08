import { fetchFile } from "/node_modules/@ffmpeg/util/dist/esm/index.js";
import { FFmpeg } from "/node_modules/@ffmpeg/ffmpeg/dist/esm/index.js";

import mime from "/node_modules/mime/dist/src/index.js";

let ffmpeg;

let supportedFormats = [];

async function init () {

  ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: "/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js",
  });

  let formatDumpStarted = false;
  const handleFormatDump = ({ message }) => {

    if (message === " --") return formatDumpStarted = true;
    else if (!formatDumpStarted) return;

    let len;
    do {
      len = message.length;
      message = message.replaceAll("  ", " ");
    } while (len !== message.length);
    message = message.trim();

    const parts = message.split(" ");
    if (parts.length < 2) return;

    const flags = parts[0];
    const description = parts.slice(2).join(" ");
    const extensions = parts[1].split(",");

    // TODO: Extract specifics with `ffmpeg -hide_banner -h muxer=<format>`
    for (const extension of extensions) {
      supportedFormats.push({
        name: description + (extensions.length > 1 ? (" / " + extension) : ""),
        format: extension,
        extension: extension,
        mime: mime.getType(extension) || ("video/" + extension),
        from: flags.includes("D"),
        to: flags.includes("E"),
        internal: extension
      });
    }

  };

  ffmpeg.on("log", handleFormatDump);
  await ffmpeg.exec(["-formats", "-hide_banner"]);
  ffmpeg.off("log", handleFormatDump);

  await ffmpeg.terminate();

}

async function doConvert (inputFile, inputFormat, outputFormat) {

  await ffmpeg.load();

  await ffmpeg.writeFile(inputFile.name, inputFile.bytes);
  await ffmpeg.exec(["-i", inputFile.name, "-f", outputFormat.internal, "output"]);
  await ffmpeg.deleteFile(inputFile.name);

  const bytes = new Uint8Array((await ffmpeg.readFile("output"))?.buffer);
  await ffmpeg.deleteFile("output");
  await ffmpeg.terminate();

  return bytes;

}

export default {
  name: "FFmpeg",
  init,
  supportedFormats,
  doConvert
};
