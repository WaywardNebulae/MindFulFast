import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SIZES = [48, 72, 96, 144, 192, 256, 512];
const MASKABLE = [192, 512];

async function render(src, out, size) {
  await sharp(src)
    .resize(size, size, { fit: 'fill' })
    .png()
    .toFile(out);
  console.log('wrote', out);
}

await mkdir('icons', { recursive: true });

for (const size of SIZES) {
  await render('icons/leaf-icon-light.svg', `icons/icon-${size}.png`, size);
  await render('icons/leaf-icon-dark.svg', `icons/icon-${size}-dark.png`, size);
}
for (const size of MASKABLE) {
  await render('icons/leaf-icon-light.svg', `icons/icon-maskable-${size}.png`, size);
  await render('icons/leaf-icon-dark.svg', `icons/icon-maskable-${size}-dark.png`, size);
}
