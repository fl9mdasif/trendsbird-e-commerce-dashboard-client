/**
 * Compresses an image File using the Canvas API.
 * Resizes to a max dimension and reduces JPEG quality until
 * the output fits within the target size range (50–150 KB).
 */
async function compressImage(
    file: File,
    maxDimension = 1024,
    targetMaxKB = 200,
    targetMinKB = 80
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            // ── Scale down to maxDimension while keeping aspect ratio
            let { width, height } = img;
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, width, height);

            // ── Iteratively reduce quality until within target range
            let quality = 0.85;
            const tryCompress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Compression failed."));

                        const kb = blob.size / 1024;

                        if (kb > targetMaxKB && quality > 0.1) {
                            // Still too large — reduce quality
                            quality = Math.max(0.1, quality - 0.1);
                            tryCompress();
                        } else {
                            // Within range (or can't compress further)
                            resolve(blob);
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };

            tryCompress();
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image for compression."));
        };

        img.src = objectUrl;
    });
}

/**
 * Compresses an image to ~50–150 KB then uploads to ImgBB.
 * Returns the permanent public URL.
 */
export async function uploadToImgBB(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) throw new Error("ImgBB API key is not configured.");

    // Compress before uploading
    const compressed = await compressImage(file);

    const formData = new FormData();
    formData.append("image", compressed, file.name.replace(/\.[^.]+$/, ".jpg"));

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Image upload failed. Please try again.");

    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Image upload failed.");

    return json.data.url as string;
}
