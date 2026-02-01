import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Tipos para las respuestas
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

// Opciones de subida por tipo de imagen
export const UPLOAD_PRESETS = {
  // Fotos de inspección (evidencia de fallas, etc.)
  inspeccion: {
    folder: "petran/inspecciones",
    transformation: [
      { width: 1200, height: 1200, crop: "limit" }, // Limitar tamaño máximo
      { quality: "auto:good" }, // Calidad automática
      { fetch_format: "auto" }, // Formato óptimo (webp si es posible)
    ],
  },
  // Fotos del vehículo (frontal, lateral, etc.)
  vehiculo: {
    folder: "petran/vehiculos",
    transformation: [
      { width: 1600, height: 1200, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  },
  // Fotos de documentos (patente, kilometraje)
  documento: {
    folder: "petran/documentos",
    transformation: [
      { width: 1200, height: 900, crop: "limit" },
      { quality: "auto:best" }, // Mayor calidad para documentos
      { fetch_format: "auto" },
    ],
  },
};

/**
 * Sube una imagen a Cloudinary desde un buffer o base64
 */
export async function uploadImage(
  fileData: string | Buffer,
  options: {
    tipo: keyof typeof UPLOAD_PRESETS;
    publicId?: string;
    tags?: string[];
    context?: Record<string, string>;
  }
): Promise<CloudinaryUploadResult> {
  const preset = UPLOAD_PRESETS[options.tipo];

  // Si es Buffer, convertir a base64 data URI
  let uploadData: string;
  if (Buffer.isBuffer(fileData)) {
    uploadData = `data:image/jpeg;base64,${fileData.toString("base64")}`;
  } else if (fileData.startsWith("data:")) {
    uploadData = fileData;
  } else {
    // Asumir que ya es base64 sin prefijo
    uploadData = `data:image/jpeg;base64,${fileData}`;
  }

  const result = await cloudinary.uploader.upload(uploadData, {
    folder: preset.folder,
    public_id: options.publicId,
    transformation: preset.transformation,
    tags: options.tags,
    context: options.context,
    resource_type: "image",
  });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    created_at: result.created_at,
  };
}

/**
 * Sube múltiples imágenes en paralelo
 */
export async function uploadMultipleImages(
  files: Array<{
    data: string | Buffer;
    tipo: keyof typeof UPLOAD_PRESETS;
    publicId?: string;
    tags?: string[];
  }>
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map((file) =>
    uploadImage(file.data, {
      tipo: file.tipo,
      publicId: file.publicId,
      tags: file.tags,
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error eliminando imagen de Cloudinary:", error);
    return false;
  }
}

/**
 * Genera una URL firmada para subida directa desde el cliente
 * Útil para subidas grandes sin pasar por el servidor
 */
export function generateUploadSignature(
  tipo: keyof typeof UPLOAD_PRESETS,
  publicId?: string
): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
} {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const preset = UPLOAD_PRESETS[tipo];

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder: preset.folder,
  };

  if (publicId) {
    paramsToSign.public_id = publicId;
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: preset.folder,
  };
}

/**
 * Genera URL optimizada para mostrar imagen
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: options?.crop || "fill",
        quality: options?.quality || "auto",
        fetch_format: "auto",
      },
    ],
  });
}

/**
 * Genera URL de thumbnail
 */
export function getThumbnailUrl(publicId: string, size = 200): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: size,
        height: size,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });
}
