import fs from "fs";
import path from "path";
import { processImage } from "../src/utils/imageProcessor";

(async () => {
  try {
    const buffer = fs.readFileSync(
      path.join(__dirname, "test.jpg")
    );

    const result = await processImage(buffer, "image/jpeg");

    console.log("Processing success:", result);

    // Verify files exist
    const projectRoot = process.cwd();
    const originalExists = fs.existsSync(path.join(projectRoot, result.originalUrl));
    const mediumExists = fs.existsSync(path.join(projectRoot, result.mediumUrl));
    const thumbExists = fs.existsSync(path.join(projectRoot, result.thumbUrl));

    if (originalExists && mediumExists && thumbExists) {
        console.log("All files verified on disk.");
    } else {
        console.error("File verification failed:", { originalExists, mediumExists, thumbExists });
        process.exit(1);
    }

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
})();
