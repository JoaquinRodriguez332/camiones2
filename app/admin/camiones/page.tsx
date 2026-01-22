"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: number;
  patente: string;
  marca: string | null;
  modelo: string | null;
  anio: number | string | null;
  tipo: string | null;
  carroceria: string | null;
  createdAt: string | null;

  empresa: {
    id: number;
    nombre: string | null;
    rut: string | null;
  };

  ui_estado: "SIN_AGENDA" | "PROGRAMADA" | "VENCIDA" | string;
  inspeccionProgramada: null | {
    id: number;
    fechaProgramada: string | null;
    inspector: null | { id: number; nombre: string | null };
  };
};

function formatDateLocal(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AdminCamionesPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"SIN_AGENDA" | "PROGRAMADA" | "VENCIDA">(
    "SIN_AGENDA"
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  // Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [modalTitle, setModalTitle] = useState("Agendar inspección");
  const [fechaLocal, setFechaLocal] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return toDatetimeLocalValue(d);
  });
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.patente ?? "").toUpperCase().includes(q)
    );
  }, [rows, query]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("estado", tab);
      if (query.trim()) params.set("patente", query.trim());

      const res = await fetch(`/api/admin/camiones?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Error interno");
        setRows([]);
        return;
      }

      setRows(Array.isArray(data.camiones) ? data.camiones : []);
    } catch (e: any) {
      setError(e?.message ?? "Error de red");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setSelected(null);
    setModalError(null);
    setObs("");
  }

  function openAgendarModal(row: Row) {
    setSelected(row);
    setModalTitle("Agendar inspección");
    setObs("");

    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    setFechaLocal(toDatetimeLocalValue(d));

    setOpen(true);
  }

  function openReagendarModal(row: Row) {
    setSelected(row);
    setModalTitle("Reagendar inspección");
    setObs("");

    if (row.inspeccionProgramada?.fechaProgramada) {
      setFechaLocal(
        toDatetimeLocalValue(
          new Date(row.inspeccionProgramada.fechaProgramada)
        )
      );
    }

    setOpen(true);
  }

  async function cancelar(row: Row) {
    const id = Number(row.inspeccionProgramada?.id);
    if (!Number.isInteger(id) || id <= 0) return;

    if (!confirm(`¿Cancelar inspección para ${row.patente}?`)) return;

    const res = await fetch(`/api/admin/inspecciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCELAR" }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      alert(data?.error ?? "No se pudo cancelar");
      return;
    }

    load();
  }

  // 🔴 AQUÍ ESTÁ EL DEBUG IMPORTANTE
  async function saveAgendaOrReagenda() {
    if (!selected) return;

    setSaving(true);
    setModalError(null);

    try {
      const fechaProgramada = fechaLocal;

      const rawId = selected.inspeccionProgramada?.id;
      const inspeccionId = Number(rawId);
      const shouldPatch =
        Number.isInteger(inspeccionId) && inspeccionId > 0;

      const url = shouldPatch
        ? `/api/admin/inspecciones/${inspeccionId}`
        : "/api/admin/inspecciones";

      const method = shouldPatch ? "PATCH" : "POST";

      const payload = shouldPatch
        ? {
            action: "REAGENDAR",
            fechaProgramada,
            observaciones: obs.trim() || null,
          }
        : {
            camionId: selected.id,
            fechaProgramada,
            observaciones: obs.trim() || null,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 🔎 DEBUG COMPLETO
      const rawText = await res.text();
      console.log("[REAGENDAR] status:", res.status);
      console.log("[REAGENDAR] raw response:", rawText);

      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {}

      console.log("[REAGENDAR] parsed response:", data);

      if (!res.ok || !data?.ok) {
        setModalError(data?.error ?? "No se pudo guardar");
        return;
      }

      closeModal();
      load();
    } catch (e: any) {
      setModalError(e?.message ?? "Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 34, fontWeight: 900 }}>Admin · Camiones</h1>

      {/* El resto del render queda IGUAL que el tuyo */}
      {/* No lo toqué para evitar romper UX */}
    </div>
  );
}
