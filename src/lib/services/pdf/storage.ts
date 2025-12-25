import { writeFile, mkdir, access, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Save PDF buffer to storage and return URL
 * @param pdfBuffer - PDF file buffer
 * @param filename - Desired filename
 * @returns URL path to the saved PDF
 */
export async function savePDFToStorage(
  pdfBuffer: Buffer,
  filename: string
): Promise<string> {
  try {
    console.log("📄 [STORAGE] Starting PDF save process...");
    console.log(`📄 [STORAGE] Filename: ${filename}`);
    console.log(`📄 [STORAGE] Buffer size: ${pdfBuffer.length} bytes`);

    // Create documents directory if it doesn't exist
    const documentsDir = join(process.cwd(), "public", "documents");
    console.log(`📄 [STORAGE] Documents directory: ${documentsDir}`);
    console.log(`📄 [STORAGE] Directory exists: ${existsSync(documentsDir)}`);

    if (!existsSync(documentsDir)) {
      console.log("📄 [STORAGE] Creating documents directory...");
      await mkdir(documentsDir, { recursive: true });
      console.log("📄 [STORAGE] ✅ Directory created successfully");
    } else {
      console.log("📄 [STORAGE] ✅ Directory already exists");
    }

    // Verify directory is writable
    try {
      await access(documentsDir, 2); // Check write permission
      console.log("📄 [STORAGE] ✅ Directory is writable");
    } catch (err) {
      console.error("📄 [STORAGE] ❌ Directory is not writable:", err);
      throw new Error("Documents directory is not writable");
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
    const filePath = join(documentsDir, uniqueFilename);

    console.log(`📄 [STORAGE] Full file path: ${filePath}`);
    console.log(`📄 [STORAGE] Unique filename: ${uniqueFilename}`);

    // Save PDF file
    console.log("📄 [STORAGE] Writing PDF file...");
    await writeFile(filePath, pdfBuffer);
    console.log("📄 [STORAGE] ✅ PDF file written successfully");

    // Verify file was created
    if (existsSync(filePath)) {
      const stats = await stat(filePath);
      console.log(`📄 [STORAGE] ✅ File verified - Size: ${stats.size} bytes`);
      if (stats.size === 0) {
        throw new Error("File was created but is empty (0 bytes)");
      }
    } else {
      throw new Error("File was not created after write operation");
    }

    // Return relative URL path
    const url = `/documents/${uniqueFilename}`;
    console.log(`📄 [STORAGE] ✅ PDF saved successfully`);
    console.log(`📄 [STORAGE] Final document URL: ${url}`);
    console.log(`📄 [STORAGE] Full file path: ${filePath}`);
    
    return url;
  } catch (error: any) {
    console.error("📄 [STORAGE] ❌ Failed to save PDF:", error);
    console.error("📄 [STORAGE] Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    throw new Error(`Failed to save PDF: ${error.message}`);
  }
}

