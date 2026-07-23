const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function safeFilename(name) {
  const base = String(name || "file")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "file";
}

function publicUploadUrl(req, storedName) {
  const host = req.headers.host || "localhost:4000";
  const proto =
    req.headers["x-forwarded-proto"] ||
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}/uploads/${storedName}`;
}

function contentTypeFromName(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
    return "application/vnd.ms-powerpoint";
  }
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
    return "application/msword";
  }
  return "application/octet-stream";
}

module.exports = {
  UPLOAD_DIR,
  ensureUploadDir,
  safeFilename,
  publicUploadUrl,
  contentTypeFromName,
  crypto,
  fs,
  path,
};
