#!/usr/bin/env node
/**
 * Generate icons without external dependencies
 * Creates PNG and ICO files from embedded SVG
 */

const fs = require('fs');
const path = require('path');

// Simple PNG generator (no dependencies)
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(2, 9);  // color type (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (simple solid color)
  const zlib = require('zlib');
  const rawData = Buffer.alloc(height * (1 + width * 3));

  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const idx = y * (1 + width * 3) + 1 + x * 3;
      // Create gradient effect
      const centerX = width / 2;
      const centerY = height / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
      const factor = 1 - (dist / maxDist) * 0.3;

      rawData[idx] = Math.min(255, Math.floor(r * factor));     // R
      rawData[idx + 1] = Math.min(255, Math.floor(g * factor)); // G
      rawData[idx + 2] = Math.min(255, Math.floor(b * factor)); // B
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = getCRC32Table();

  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }

  return crc ^ 0xFFFFFFFF;
}

let crcTable = null;
function getCRC32Table() {
  if (crcTable) return crcTable;

  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  return crcTable;
}

// Create ICO file from PNG buffers
function createICO(pngBuffers) {
  const count = pngBuffers.length;

  // ICONDIR
  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0);      // Reserved
  iconDir.writeUInt16LE(1, 2);      // Type: 1 = ICO
  iconDir.writeUInt16LE(count, 4);  // Number of images

  // ICONDIRENTRY for each image
  let offset = 6 + count * 16;
  const entries = [];
  const imageData = [];

  const sizes = [256, 128, 64, 48, 32, 16];

  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i];
    const size = sizes[i] || 256;

    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);  // Width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // Height (0 = 256)
    entry.writeUInt8(0, 2);         // Colors
    entry.writeUInt8(0, 3);         // Reserved
    entry.writeUInt16LE(1, 4);      // Color planes
    entry.writeUInt16LE(32, 6);     // Bits per pixel
    entry.writeUInt32LE(png.length, 8);  // Size of image data
    entry.writeUInt32LE(offset, 12);     // Offset to image data

    entries.push(entry);
    imageData.push(png);
    offset += png.length;
  }

  return Buffer.concat([iconDir, ...entries, ...imageData]);
}

// Main
const outputDir = path.join(__dirname);

console.log('Generating icons...');

// Generate PNG files with purple gradient
const sizes = [16, 32, 48, 64, 128, 256];
const pngBuffers = [];

for (const size of sizes) {
  const png = createPNG(size, size, 124, 58, 237); // Purple color
  fs.writeFileSync(path.join(outputDir, `${size}x${size}.png`), png);
  console.log(`  Created ${size}x${size}.png`);
  pngBuffers.unshift(png); // Add to beginning for ICO (largest first)
}

// Generate ICO
const ico = createICO(pngBuffers.reverse());
fs.writeFileSync(path.join(outputDir, 'icon.ico'), ico);
console.log('  Created icon.ico');

console.log('Done!');