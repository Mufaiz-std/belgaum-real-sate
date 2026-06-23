'use client'

/**
 * Client-side image optimizer using Canvas API.
 * - Resizes to max 1280px width while maintaining aspect ratio.
 * - Converts to WEBP format.
 * - Targets ~200 KB; falls back to reducing quality until below 300 KB.
 * No npm dependencies required.
 */

const MAX_WIDTH = 1280
const TARGET_SIZE_BYTES = 200 * 1024  // 200 KB
const MAX_SIZE_BYTES = 300 * 1024     // 300 KB hard cap
const INITIAL_QUALITY = 0.85
const MIN_QUALITY = 0.30
const QUALITY_STEP = 0.05

export interface OptimizationResult {
  file: File
  originalSize: number
  optimizedSize: number
  format: string
}

/**
 * Loads a File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load image: ${file.name}`))
    }
    img.src = url
  })
}

/**
 * Converts an HTMLImageElement to a Blob at the given quality.
 * Always outputs WEBP when supported.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
  mimeType = 'image/webp'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob returned null'))
      },
      mimeType,
      quality
    )
  })
}

/**
 * Checks if WEBP encoding is supported by the browser.
 */
function isWebpSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    return false
  }
}

/**
 * Main optimizer function.
 * Resizes, converts to WEBP (or JPEG fallback), and iteratively
 * reduces quality until the file is below MAX_SIZE_BYTES.
 */
export async function optimizeImage(file: File): Promise<OptimizationResult> {
  const originalSize = file.size
  const webpSupported = isWebpSupported()
  const outputMime = webpSupported ? 'image/webp' : 'image/jpeg'
  const outputExt = webpSupported ? 'webp' : 'jpg'

  // Load the image
  const img = await loadImage(file)

  // Calculate new dimensions (maintain aspect ratio)
  let { width, height } = img
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width)
    width = MAX_WIDTH
  }

  // Draw onto canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas 2D context')
  ctx.drawImage(img, 0, 0, width, height)

  // Iteratively reduce quality to hit target size
  let quality = INITIAL_QUALITY
  let blob: Blob = await canvasToBlob(canvas, quality, outputMime)

  // If already under target, we're done
  if (blob.size <= TARGET_SIZE_BYTES) {
    const optimizedFile = new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, '')}.${outputExt}`,
      { type: outputMime }
    )
    return { file: optimizedFile, originalSize, optimizedSize: blob.size, format: outputMime }
  }

  // Reduce quality until below hard cap
  while (blob.size > MAX_SIZE_BYTES && quality > MIN_QUALITY) {
    quality = Math.round((quality - QUALITY_STEP) * 100) / 100
    blob = await canvasToBlob(canvas, quality, outputMime)
  }

  // If still above hard cap after min quality, accept it (very large/complex image)
  const optimizedFile = new File(
    [blob],
    `${file.name.replace(/\.[^.]+$/, '')}.${outputExt}`,
    { type: outputMime }
  )

  return {
    file: optimizedFile,
    originalSize,
    optimizedSize: blob.size,
    format: outputMime,
  }
}
