import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sellerMockPath = path.join(
  rootDir,
  "src",
  "server",
  "mockSeller",
  "sellerApp.json"
);
const outputDir = path.join(
  rootDir,
  "public",
  "mock",
  "products"
);

const WAIT_MS = Number(process.env.IMAGE_WAIT_MS ?? 90000);
const RETRIES = Number(process.env.IMAGE_RETRIES ?? 3);
const FORCE = process.argv.includes("--force");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizePrompt(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s.,-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getOutputFile(product) {
  const fileName = product.img.split("/").pop();

  if (!fileName) {
    throw new Error(`Producto sin nombre de imagen: ${product.id}`);
  }

  return path.join(outputDir, fileName);
}

function buildImageUrl(product) {
  const prompt = normalizePrompt(
    `foto realista de ${product.name}, producto de materiales de construccion, fondo blanco, iluminacion de estudio, sin texto, sin marca de agua`
  );
  const seed = Number(product.id.replace(/\D/g, "")) || 1;
  const params = new URLSearchParams({
    width: "800",
    height: "800",
    seed: String(seed),
    nologo: "true",
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

async function fileExists(filePath) {
  try {
    const file = await readFile(filePath);

    return file.length > 0;
  } catch {
    return false;
  }
}

async function downloadImage(product, attempt = 1) {
  const url = buildImageUrl(product);
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.startsWith("image/")) {
    const body = await response.text().catch(() => "");
    const retryable =
      response.status === 429 ||
      body.toLowerCase().includes("queue full");

    if (retryable && attempt < RETRIES) {
      console.log(
        `  limite/cola alcanzado, reintento ${attempt + 1}/${RETRIES} en ${Math.round(WAIT_MS / 1000)}s`
      );
      await sleep(WAIT_MS);

      return downloadImage(product, attempt + 1);
    }

    throw new Error(
      `No se pudo generar ${product.id}. Status ${response.status}. ${body.slice(0, 160)}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(getOutputFile(product), buffer);
}

async function main() {
  const sellerMock = JSON.parse(
    await readFile(sellerMockPath, "utf8")
  );

  await mkdir(outputDir, { recursive: true });

  const products = sellerMock.products;
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, product] of products.entries()) {
    const outputFile = getOutputFile(product);
    const label = `${index + 1}/${products.length} ${product.id} ${product.name}`;

    if (!FORCE && (await fileExists(outputFile))) {
      skipped += 1;
      console.log(`skip ${label}`);
      continue;
    }

    try {
      console.log(`gen  ${label}`);
      await downloadImage(product);
      generated += 1;
      await sleep(WAIT_MS);
    } catch (error) {
      failed += 1;
      console.error(
        `fail ${label}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  console.log(
    `Listo. Generadas: ${generated}. Saltadas: ${skipped}. Fallidas: ${failed}.`
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
