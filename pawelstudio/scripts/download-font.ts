import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const fontUrl = 'https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/cloister-black.zip';
const publicDir = path.join(process.cwd(), 'public');
const fontsDir = path.join(publicDir, 'fonts');
const zipPath = path.join(fontsDir, 'font.zip');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

console.log('Downloading font from:', fontUrl);

async function downloadAndExtract() {
  try {
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(zipPath, Buffer.from(buffer));
    console.log('Download completed. Size:', buffer.byteLength);

    console.log('Extracting...');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(fontsDir, true);
    console.log('Extraction completed.');

    // List extracted files
    const files = fs.readdirSync(fontsDir);
    console.log('Extracted files:', files);

    // Clean up zip file
    fs.unlinkSync(zipPath);

  } catch (error) {
    console.error('Error:', error);
  }
}

downloadAndExtract();
