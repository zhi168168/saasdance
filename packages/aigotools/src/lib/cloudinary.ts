"use server";

import { createHash } from "crypto";

import { AppConfig } from "@/lib/config";

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

function ensureCloudinaryConfig() {
  if (
    !AppConfig.cloudinaryCloudName ||
    !AppConfig.cloudinaryApiKey ||
    !AppConfig.cloudinaryApiSecret
  ) {
    throw new Error("Cloudinary is not configured");
  }
}

function createSignature(timestamp: number) {
  const params = [
    `folder=${AppConfig.cloudinaryFolder}`,
    `timestamp=${timestamp}`,
  ].join("&");

  return createHash("sha1")
    .update(`${params}${AppConfig.cloudinaryApiSecret}`)
    .digest("hex");
}

async function uploadToCloudinary(file: Blob | string, fileName?: string) {
  ensureCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const formData = new FormData();

  if (typeof file === "string") {
    formData.append("file", file);
  } else {
    formData.append("file", file, fileName);
  }
  formData.append("api_key", AppConfig.cloudinaryApiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", AppConfig.cloudinaryFolder);
  formData.append("signature", createSignature(timestamp));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${AppConfig.cloudinaryCloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Failed to upload to Cloudinary");
  }

  return data.secure_url;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  contentType: string,
  fileName = "image"
) {
  const blob = new Blob([new Uint8Array(buffer)], { type: contentType });

  return uploadToCloudinary(blob, fileName);
}

export async function uploadRemoteImageToCloudinary(url: string) {
  return uploadToCloudinary(url);
}

export async function uploadFormDataToCloudinary(formData: FormData) {
  const files = formData.getAll("files") as File[];

  return Promise.all(
    files.map(async (file) => {
      return uploadToCloudinary(file, file.name);
    })
  );
}
