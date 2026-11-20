const { createHash } = require("node:crypto");
const { createWriteStream } = require("node:fs");
const { mkdir, rename, rm } = require("node:fs/promises");
const path = require("node:path");
const { Readable, Transform } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const APP_URL =
  "https://github.com/webdriverio/native-demo-app/releases/download/v2.2.0/android.wdio.native.app.v2.2.0.apk";
const EXPECTED_SHA256 =
  "fe1d605ce099c73d93f33e5cbcb0df0bea437ce57aaaaf156b3b0fa1ca54931d";
const outputDirectory = path.join(__dirname, "apps");
const outputPath = path.join(
  outputDirectory,
  "android.wdio.native.app.v2.2.0.apk"
);
const temporaryPath = `${outputPath}.download`;

async function downloadApp() {
  const response = await fetch(APP_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Não foi possível baixar o aplicativo: HTTP ${response.status}`);
  }

  await mkdir(outputDirectory, { recursive: true });

  const digest = createHash("sha256");
  const hashStream = new Transform({
    transform(chunk, encoding, callback) {
      digest.update(chunk);
      callback(null, chunk);
    }
  });

  try {
    await pipeline(
      Readable.fromWeb(response.body),
      hashStream,
      createWriteStream(temporaryPath)
    );

    const actualSha256 = digest.digest("hex");
    if (actualSha256 !== EXPECTED_SHA256) {
      throw new Error("A verificação SHA-256 do APK falhou.");
    }

    await rename(temporaryPath, outputPath);
    console.log(`Aplicativo Android baixado e verificado: ${outputPath}`);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

downloadApp().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
