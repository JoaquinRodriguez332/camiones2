import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { requireAdmin } from "@/lib/staff-auth";

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      server: process.env.AZURE_SQL_SERVER!,
      database: process.env.AZURE_SQL_DATABASE!,
      options: { encrypt: true, trustServerCertificate: false },
      connectionTimeout: 30000,
      requestTimeout: 30000,
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    }).connect();
  }
  return poolPromise;
}

// ✅ "YYYY-MM-DDTHH:mm"
function isValidDatetimeLocal(s: unknown) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s);
}

// PATCH: reagendar o cancelar
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = requireAdmin(req);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    // ✅ Robust id: params + fallback URL
    const idFromParams = params?.id;
    const idFromPath = req.nextUrl.pathname.split("/").pop();
    const idStr = idFromParams ?? idFromPath ?? "";
    const inspeccionId = Number(idStr);

    console.log("PATCH /inspecciones/[id] idStr:", idStr, "parsed:", inspeccionId, "path:", req.nextUrl.pathname);

    if (!Number.isInteger(inspeccionId) || inspeccionId <= 0) {
      return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
    }

    const action = (body as any).action;

    const pool = await getPool();

    // Debe existir y estar PROGRAMADA
    const current = await pool.request()
      .input("id", sql.Int, inspeccionId)
      .query(`
        SELECT TOP 1 id, estado
        FROM dbo.inspecciones
        WHERE id = @id
      `);

    if (current.recordset.length === 0) {
      return NextResponse.json({ ok: false, error: "Inspección no existe" }, { status: 404 });
    }

    const estadoActual = String(current.recordset[0].estado);

    if (estadoActual !== "PROGRAMADA") {
      return NextResponse.json(
        { ok: false, error: "Solo se puede modificar una inspección PROGRAMADA" },
        { status: 409 }
      );
    }

    if (action === "CANCELAR") {
      await pool.request()
        .input("id", sql.Int, inspeccionId)
        .query(`
          UPDATE dbo.inspecciones
          SET estado = 'CANCELADA'
          WHERE id = @id
        `);

      return NextResponse.json({ ok: true });
    }

    if (action === "REAGENDAR") {
      const fechaLocal = (body as any).fechaProgramada;
      const obs = typeof (body as any).observaciones === "string" ? (body as any).observaciones.trim() : null;

      if (!isValidDatetimeLocal(fechaLocal)) {
        return NextResponse.json({ ok: false, error: "fechaProgramada inválida" }, { status: 400 });
      }

      const fechaSql = `${fechaLocal.replace("T", " ")}:00`;

      // Validación futura en SQL (evita TZ issues en Vercel)
      await pool.request()
        .input("fecha", sql.NVarChar(19), fechaSql)
        .query(`
          IF (CONVERT(datetime2, @fecha, 120) < DATEADD(minute, 1, SYSDATETIME()))
            THROW 50001, 'La fecha debe ser futura', 1;
        `);

      await pool.request()
        .input("id", sql.Int, inspeccionId)
        .input("fecha", sql.NVarChar(19), fechaSql)
        .input("obs", sql.NVarChar(sql.MAX), obs)
        .query(`
          UPDATE dbo.inspecciones
          SET
            fecha_programada = CONVERT(datetime2, @fecha, 120),
            fecha_inspeccion = CONVERT(datetime2, @fecha, 120),
            observaciones_generales = COALESCE(NULLIF(@obs, ''), observaciones_generales)
          WHERE id = @id
        `);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Acción inválida" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/admin/inspecciones/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
