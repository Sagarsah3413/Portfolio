import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request) {
    try {
        const auth = request.headers.get("authorization");
        if (auth !== "Bearer admin_authenticated") {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const fileType = formData.get("type") || "image"; // "image" or "resume"

        if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), {
                status: 400,
            });
        }

        // Validate file type based on upload type
        let validMimes = [];
        let maxSize = 5 * 1024 * 1024; // default 5MB

        if (fileType === "resume") {
            validMimes = ["application/pdf"];
            maxSize = 10 * 1024 * 1024; // 10MB for PDF
        } else {
            validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        }

        if (!validMimes.includes(file.type)) {
            return new Response(
                JSON.stringify({
                    error: fileType === "resume"
                        ? "Invalid file type. Only PDF is allowed for resume"
                        : "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed",
                }),
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            return new Response(
                JSON.stringify({ error: `File size must be less than ${maxSizeMB}MB` }),
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename with timestamp
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const fileName = `${timestamp}.${extension}`;

        // Create public/uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Save file
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/${fileName}`;

        return new Response(
            JSON.stringify({
                success: true,
                url: publicUrl,
                fileName: fileName,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
