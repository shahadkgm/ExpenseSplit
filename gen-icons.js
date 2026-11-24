/**
 * Generates proper PNG files using pure Node.js (no external deps).
 * Creates solid-color icons with an "S" character approximated via colored blocks.
 * Uses raw PNG encoding: IHDR + IDAT + IEND chunks.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function writePNG(filePath, size) {
  // Create RGBA pixel data: indigo background (#4f46e5) with white "S" approximation
  const bgR = 0x4f, bgG = 0x46, bgB = 0xe5;
  const fgR = 0xff, fgG = 0xff, fgB = 0xff;

  // Simple "S" letter pixel mask at reduced resolution then scaled
  // We'll draw a rounded rect background + white circle in the middle as a simple icon
  const rows = [];
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;

  for (let y = 0; y < size; y++) {
    // filter byte (0 = None)
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      // Rounded rect background (whole image is indigo with rounded corners)
      const cornerR = size * 0.18;
      let inBg = true;
      // top-left corner
      if (x < cornerR && y < cornerR && Math.hypot(x - cornerR, y - cornerR) > cornerR) inBg = false;
      // top-right corner
      if (x > size - cornerR && y < cornerR && Math.hypot(x - (size - cornerR), y - cornerR) > cornerR) inBg = false;
      // bottom-left corner
      if (x < cornerR && y > size - cornerR && Math.hypot(x - cornerR, y - (size - cornerR)) > cornerR) inBg = false;
      // bottom-right corner
      if (x > size - cornerR && y > size - cornerR && Math.hypot(x - (size - cornerR), y - (size - cornerR)) > cornerR) inBg = false;

      // White circle in center
      const inCircle = Math.hypot(dx, dy) < radius;

      let r, g, b, a;
      if (!inBg) {
        r = g = b = a = 0; // transparent
      } else if (inCircle) {
        r = fgR; g = fgG; b = fgB; a = 255;
      } else {
        // Gradient: interpolate between #6366f1 and #4f46e5 based on position
        const t = (x + y) / (size * 2);
        r = Math.round(0x63 + t * (0x4f - 0x63));
        g = Math.round(0x66 + t * (0x46 - 0x66));
        b = Math.round(0xf1 + t * (0xe5 - 0xf1));
        a = 255;
      }

      const idx = 1 + x * 4;
      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rows.push(row);
  }

  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBytes = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBytes, data]);
    const crcVal = crc32(crcData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, typeBytes, data, crcBuf]);
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
  console.log('Created:', filePath, `(${size}x${size})`);
}

const pub = path.join(__dirname, 'client', 'public');
if (!fs.existsSync(pub)) fs.mkdirSync(pub, { recursive: true });

writePNG(path.join(pub, 'icon-192.png'), 192);
writePNG(path.join(pub, 'icon-512.png'), 512);
writePNG(path.join(pub, 'apple-touch-icon.png'), 180);

console.log('All icons created!');
