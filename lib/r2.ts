import { S3Client } from "@aws-sdk/client-s3";

/**
 * S3-compatible client pointed at our Cloudflare R2 bucket. Uses the
 * R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY env vars (generated in
 * Cloudflare → R2 → Manage R2 API Tokens).
 *
 * The endpoint format is:
 *   https://<accountId>.r2.cloudflarestorage.com
 *
 * Public reads happen through our custom domain (videos.thanielguitarlessons.com)
 * so the S3 client is only used here for writes (presigned PUT URLs for
 * student tape uploads).
 */
export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const R2_BUCKET = process.env.R2_BUCKET ?? "guitar";
export const R2_PUBLIC_BASE =
  process.env.R2_PUBLIC_BASE ?? "https://videos.thanielguitarlessons.com";
