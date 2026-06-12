import "server-only";
import { createHash, createHmac } from "node:crypto";

// Minimal SigV4 PutObject for com27 bucket — avoids the aws-sdk dependency weight.
// Reads env directly each call so deploys can rotate keys without re-bundling.
// Ported from ~/APPS/wikai/lib/s3.ts.

interface S3Config {
  accessKey: string;
  secret: string;
  bucket: string;
  region: string;
  endpoint: string;
}

function getConfig(): S3Config | null {
  const accessKey = (process.env.S3_ACCESS_KEY || "").trim();
  const secret = (process.env.S3_SECRET_ACCESS_KEY || "").trim();
  const bucket = (process.env.S3_BUCKET_NAME || "com27").trim();
  const region = (process.env.S3_REGION || "eu-west-2").trim();
  const endpoint = (process.env.S3_ENDPOINT || `https://s3.${region}.amazonaws.com`).trim();
  if (!accessKey || !secret) return null;
  return { accessKey, secret, bucket, region, endpoint };
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function awsDate(d = new Date()): { amz: string; ymd: string } {
  const iso = d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return { amz: iso, ymd: iso.slice(0, 8) };
}

export interface S3PutResult {
  url: string;
  key: string;
  bytes: number;
}

export async function s3Put(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<S3PutResult | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  const { amz, ymd } = awsDate();
  const host = new URL(cfg.endpoint).host;
  const reqPath = `/${cfg.bucket}/${encodeURI(key).replace(/'/g, "%27")}`;
  const payloadHash = sha256Hex(body);

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amz}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    reqPath,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${ymd}/${cfg.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac("AWS4" + cfg.secret, ymd);
  const kRegion = hmac(kDate, cfg.region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString("hex");

  const auth = `AWS4-HMAC-SHA256 Credential=${cfg.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `${cfg.endpoint}${reqPath}`;
  const ab = new ArrayBuffer(body.byteLength);
  new Uint8Array(ab).set(body);
  const blob = new Blob([ab], { type: contentType });
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amz,
      Authorization: auth,
    },
    body: blob,
  });
  if (!res.ok) return null;
  return { url: publicUrl(cfg.bucket, key), key, bytes: body.length };
}

export async function s3Head(key: string): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg) return false;
  const url = `${cfg.endpoint}/${cfg.bucket}/${encodeURI(key).replace(/'/g, "%27")}`;
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

export function publicUrl(bucket: string, key: string): string {
  return `https://${bucket}.s3.amazonaws.com/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function s3PublicUrl(key: string): string {
  const bucket = (process.env.S3_BUCKET_NAME || "com27").trim();
  return publicUrl(bucket, key);
}
