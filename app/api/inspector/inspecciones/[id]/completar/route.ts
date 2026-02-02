import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/azure-sql";
import { requireInspector } from "@/lib/shared/security/staff-auth";

/**
 * POST /api/inspector/inspecciones/[id]/completar
 * Completa una inspección con respuestas y fotos
 * Solo el inspector asignado puede completar su inspección
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: camion_id } = await params;

    // Verificar JWT y rol
    const session = requireInspector(req);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const inspector_id = session.userId;
    const body = await req.json();
    const {
      respuestas,
      notaFinal,
      observacionesGenerales,
      fotos_evidencia,
    } = body;

    if (!respuestas || !Array.isArray(respuestas)) {
      return NextResponse.json(
        { error: "Respuestas inválidas" },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // 1. Verificar que la inspección pertenece al inspector
    // ✅ ERROR 3 CORREGIDO: Solo buscar PROGRAMADA
    const inspeccionCheck = await pool
      .request()
      .input("camion_id", camion_id)
      .input("inspector_id", inspector_id)
      .query(`
        SELECT id FROM inspecciones 
        WHERE camion_id = @camion_id 
        AND inspector_id = @inspector_id
        AND estado = 'PROGRAMADA'
      `);

    if (inspeccionCheck.recordset.length === 0) {
      return NextResponse.json(
        { error: "Inspección no encontrada o ya completada" },
        { status: 404 }
      );
    }

    const inspeccion_id = inspeccionCheck.recordset[0].id;

    // 2. Actualizar inspección principal
    // ✅ ERROR 1 CORREGIDO: Usar REALIZADA en lugar de COMPLETADA
    await pool
      .request()
      .input("inspeccion_id", inspeccion_id)
      .input("notaFinal", notaFinal || 0)
      .input("observaciones", observacionesGenerales || null)
      .input("estado", "REALIZADA")
      .input("fechaCompletacion", new Date())
      .query(`
        UPDATE inspecciones
        SET 
          nota_final = @notaFinal,
          resultado_detallado = @observaciones,
          estado = @estado,
          fecha_inspeccion = @fechaCompletacion,
          resultado_general = CASE 
            WHEN @notaFinal >= 80 THEN 'aprobado'
            WHEN @notaFinal >= 60 THEN 'observado'
            ELSE 'rechazado'
          END
        WHERE id = @inspeccion_id
      `);

    // 3. Insertar detalle de cada ítem
    // ✅ ERROR 2 CORREGIDO: Agregar campo categoria
    for (const respuesta of respuestas) {
      
      // Obtener la categoría del item
      const itemInfo = await pool
        .request()
        .input("item_id", respuesta.itemId)
        .query(`
          SELECT categoria FROM items_inspeccion
          WHERE id = @item_id
        `);

      const categoria = itemInfo.recordset[0]?.categoria || "General";

      const exists = await pool
        .request()
        .input("inspeccion_id", inspeccion_id)
        .input("item_id", respuesta.itemId)
        .query(`
          SELECT id FROM detalle_inspeccion
          WHERE inspeccion_id = @inspeccion_id
          AND item_id = @item_id
        `);

      if (exists.recordset.length > 0) {
        // Update
        await pool
          .request()
          .input("detalle_id", exists.recordset[0].id)
          .input("resultado", respuesta.estado)
          .input("descripcion", respuesta.descripcionFalla || null)
          .input("motivo", respuesta.motivoNoAplica || null)
          .input("categoria", categoria)
          .query(`
            UPDATE detalle_inspeccion
            SET 
              resultado = @resultado,
              descripcion_falla = @descripcion,
              motivo_no_aplica = @motivo,
              categoria = @categoria
            WHERE id = @detalle_id
          `);
      } else {
        // Insert
        await pool
          .request()
          .input("inspeccion_id", inspeccion_id)
          .input("item_id", respuesta.itemId)
          .input("resultado", respuesta.estado)
          .input("descripcion", respuesta.descripcionFalla || null)
          .input("motivo", respuesta.motivoNoAplica || null)
          .input("categoria", categoria)
          .query(`
            INSERT INTO detalle_inspeccion 
            (inspeccion_id, item_id, resultado, descripcion_falla, motivo_no_aplica, categoria)
            VALUES (@inspeccion_id, @item_id, @resultado, @descripcion, @motivo, @categoria)
          `);
      }
    }

    // 4. Insertar fotos de evidencia (si existen)
    if (fotos_evidencia && Array.isArray(fotos_evidencia)) {
      for (const foto_url of fotos_evidencia) {
        await pool
          .request()
          .input("inspeccion_id", inspeccion_id)
          .input("url", foto_url)
          .input("fecha", new Date())
          .query(`
            INSERT INTO fotos_inspeccion 
            (inspeccion_id, nombre_archivo, fecha_captura)
            VALUES (@inspeccion_id, @url, @fecha)
          `);
      }
    }

    // ✅ ERROR 4 CORREGIDO: Devolver REALIZADA en lugar de COMPLETADA
    return NextResponse.json({
      success: true,
      message: "Inspección completada",
      data: {
        inspeccion_id,
        nota_final: notaFinal,
        estado: "REALIZADA",
        respuestas_guardadas: respuestas.length,
        fotos_guardadas: fotos_evidencia?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error completando inspección:", error);
    return NextResponse.json(
      { error: "Error al completar inspección" },
      { status: 500 }
    );
  }
}
