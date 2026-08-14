function pickImagePlan(sizeBytes) {
  const mb = sizeBytes / (1024 * 1024);
  if (mb > 12) return { maxSide: 1080, quality: 0.55, mime: "image/jpeg" };
  if (mb > 6) return { maxSide: 1280, quality: 0.62, mime: "image/jpeg" };
  if (mb > 3) return { maxSide: 1600, quality: 0.72, mime: "image/jpeg" };
  if (mb > 1.5) return { maxSide: 1920, quality: 0.8, mime: "image/jpeg" };
  return { maxSide: 2048, quality: 0.88, mime: "image/jpeg" };
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Не удалось сжать изображение"));
        else resolve(blob);
      },
      mime,
      quality
    );
  });
}

export async function compressImageFile(file) {
  if (!file?.type?.startsWith("image/")) {
    return { file, skipped: true, reason: "not-image" };
  }

  if (file.type === "image/gif") {
    return { file, skipped: true, reason: "gif" };
  }

  const plan = pickImagePlan(file.size);
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  const scale = Math.min(1, plan.maxSide / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  let quality = plan.quality;
  let blob = await canvasToBlob(canvas, plan.mime, quality);

  let guard = 0;
  while (blob.size > 1.8 * 1024 * 1024 && quality > 0.4 && guard < 6) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, plan.mime, quality);
    guard += 1;
  }

  if (blob.size >= file.size * 0.95 && scale === 1) {
    return {
      file,
      skipped: true,
      reason: "already-small",
      originalSize: file.size,
      finalSize: file.size,
    };
  }

  const name = (file.name || "photo").replace(/\.\w+$/, "") + ".jpg";
  const out = new File([blob], name, {
    type: plan.mime,
    lastModified: Date.now(),
  });

  return {
    file: out,
    skipped: false,
    originalSize: file.size,
    finalSize: out.size,
    quality,
    width: w,
    height: h,
  };
}

export async function prepareMediaFile(file) {
  if (!file) throw new Error("Файл не выбран");

  const MAX_SIZE = 25 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("Файл слишком большой (максимум 25 МБ)");
  }

  if (file.type.startsWith("image/")) {
    return compressImageFile(file);
  }

  if (file.type.startsWith("video/")) {
    return {
      file,
      skipped: true,
      reason: "video-passthrough",
      originalSize: file.size,
      finalSize: file.size,
      note: "Видео без перекодирования в браузере",
    };
  }

  throw new Error("Только изображение или видео");
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}