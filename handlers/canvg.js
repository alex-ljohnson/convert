import { Canvg } from "https://cdn.skypack.dev/canvg@^4.0.0";

const supportedFormats = [
  {
    name: "Scalable Vector Graphics",
    format: "svg",
    extension: "svg",
    mime: "image/svg+xml",
    from: true,
    to: false,
    internal: "svg"
  },
  {
    name: "Portable Network Graphics",
    format: "png",
    extension: "png",
    mime: "image/png",
    from: false,
    to: true,
    internal: "png"
  },
  {
    name: "Joint Photographic Experts Group",
    format: "jpeg",
    extension: "jpg",
    mime: "image/jpeg",
    from: false,
    to: true,
    internal: "jpeg"
  },
  {
    name: "WebP",
    format: "webp",
    extension: "webp",
    mime: "image/webp",
    from: false,
    to: true,
    internal: "webp"
  },
  {
    name: "CompuServe Graphics Interchange Format (GIF)",
    format: "gif",
    extension: "gif",
    mime: "image/gif",
    from: false,
    to: false,
    internal: "gif"
  }
];

let canvas, ctx;

async function init () {

  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

}

async function doConvert (inputFile, inputFormat, outputFormat) {

  if (inputFormat.format === "svgz") throw "Compressed SVG not supported";

  const string = new TextDecoder().decode(inputFile.bytes);
  const v = await Canvg.fromString(ctx, string);
  v.render();

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject("Canvas output failed");
      blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
    }, outputFormat.mime);
  });

}

export default {
  name: "Canvg",
  init,
  supportedFormats,
  doConvert
};

