#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const [filePath, publicId] = process.argv.slice(2);

if (!filePath || !publicId) {
  console.error(
    "Usage: node scripts/upload-cloudinary-3d.mjs <file-path> <public-id>"
  );
  process.exit(1);
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET;

if (!cloudName || !uploadPreset) {
  console.error(
    "Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or CLOUDINARY_UNSIGNED_UPLOAD_PRESET"
  );
  process.exit(1);
}

const bytes = await readFile(filePath);
const form = new FormData();
form.append(
  "file",
  new Blob([bytes]),
  path.basename(filePath)
);
form.append("upload_preset", uploadPreset);
form.append("public_id", publicId);
form.append("tags", "pna,manual-therapy,3d-anatomy");

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  {
    method: "POST",
    body: form,
  }
);

const body = await response.json();

if (!response.ok) {
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      public_id: body.public_id,
      secure_url: body.secure_url,
      width: body.width,
      height: body.height,
      format: body.format,
      bytes: body.bytes,
    },
    null,
    2
  )
);
