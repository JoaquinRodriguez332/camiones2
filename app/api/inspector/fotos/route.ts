import { NextRequest, NextResponse } from "next/server";
import { requireInspector } from "@/lib/shared/security/staff-auth";
import { uploadImage, deleteImage, generateUploadSignature, UPLOAD_PRESETS } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * POST /api/inspector/fotos
 * Sube una foto a Cloudinary
 *
 * Body (JSON):
 * - file: string (base64 de la imagen)
 * - tipo: "inspeccion" | "vehiculo" | "documento"
 * - inspeccionId?: number (opcional, para asociar a inspección)
 * - camionId?: number (opcional, para asociar a camión)
 * - categoria?: string (opcional, ej: "frontal", "lateral", "neumaticos")
 *
 * Body (FormData):
 * - file: File
 * - tipo: string
 * - inspeccionId?: string
 * - camionId?: string
 * - categoria?: string
 */
export async function POST(req: NextRequest) {
  try {
    const session = requireInspector(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let fileData: string;
    let tipo: keyof typeof UPLOAD_PRESETS = "inspeccion";
    let inspeccionId: number | undefined;
    let camionId: number | undefined;
    let categoria: string | undefined;

    // Procesar según el tipo de contenido
    if (contentType.includes("multipart/form-data")) {
      // FormData (subida de archivo directo)
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
      }

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "La imagen es muy grande (máximo 10MB)" }, { status: 400 });
      }

      // Convertir File a Buffer y luego a base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileData = buffer.toString("base64");

      // Obtener otros campos
      tipo = (formData.get("tipo") as keyof typeof UPLOAD_PRESETS) || "inspeccion";
      const inspeccionIdStr = formData.get("inspeccionId") as string;
      const camionIdStr = formData.get("camionId") as string;
      categoria = formData.get("categoria") as string;

      if (inspeccionIdStr) inspeccionId = parseInt(inspeccionIdStr);
      if (camionIdStr) camionId = parseInt(camionIdStr);

    } else {
      // JSON con base64
      const body = await req.json().catch(() => null);

      if (!body || !body.file) {
        return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 });
      }

      fileData = body.file;
      tipo = body.tipo || "inspeccion";
      inspeccionId = body.inspeccionId;
      camionId = body.camionId;
      categoria = body.categoria;
    }

    // Validar tipo
    if (!UPLOAD_PRESETS[tipo]) {
      return NextResponse.json({ error: "Tipo de imagen inválido" }, { status: 400 });
    }

    // Generar ID público único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    let publicId = `${timestamp}_${randomId}`;

    // Agregar contexto si está disponible
    if (camionId) publicId = `camion_${camionId}_${publicId}`;
    if (inspeccionId) publicId = `insp_${inspeccionId}_${publicId}`;
    if (categoria) publicId = `${categoria}_${publicId}`;

    // Tags para organización
    const tags: string[] = [`inspector_${session.userId}`];
    if (inspeccionId) tags.push(`inspeccion_${inspeccionId}`);
    if (camionId) tags.push(`camion_${camionId}`);
    if (categoria) tags.push(categoria);

    // Subir a Cloudinary
    const result = await uploadImage(fileData, {
      tipo,
      publicId,
      tags,
      context: {
        inspector_id: String(session.userId),
        inspeccion_id: inspeccionId ? String(inspeccionId) : "",
        camion_id: camionId ? String(camionId) : "",
        categoria: categoria || "",
        uploaded_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });

  } catch (error) {
    console.error("[API] POST /api/inspector/fotos error:", error);
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inspector/fotos
 * Elimina una foto de Cloudinary
 *
 * Body:
 * - publicId: string
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = requireInspector(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body || !body.publicId) {
      return NextResponse.json({ error: "publicId es requerido" }, { status: 400 });
    }

    const deleted = await deleteImage(body.publicId);

    if (!deleted) {
      return NextResponse.json({ error: "No se pudo eliminar la imagen" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API] DELETE /api/inspector/fotos error:", error);
    return NextResponse.json(
      { error: "Error al eliminar imagen" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inspector/fotos/signature
 * Genera firma para subida directa desde el cliente
 */
export async function GET(req: NextRequest) {
  try {
    const session = requireInspector(req);
    if (!session || !session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = (searchParams.get("tipo") as keyof typeof UPLOAD_PRESETS) || "inspeccion";

    if (!UPLOAD_PRESETS[tipo]) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const signature = generateUploadSignature(tipo);

    return NextResponse.json({
      success: true,
      data: signature,
    });

  } catch (error) {
    console.error("[API] GET /api/inspector/fotos error:", error);
    return NextResponse.json(
      { error: "Error generando firma" },
      { status: 500 }
    );
  }
}
