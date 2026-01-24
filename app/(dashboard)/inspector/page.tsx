"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle, Clock, Camera, LogOut, Key, ChevronDown } from "lucide-react";

interface Inspeccion {
  id: string;
  camion_id: string;
  patente: string;
  marca: string;
  modelo: string;
  empresa: string;
  estado: "PROGRAMADA" | "EN_PROGRESO" | "COMPLETADA";
  fecha_programada: string;
  item_count: number;
}

interface Inspector {
  nombre: string;
  email: string;
  id: string;
}

export default function InspectorHome() {
  const router = useRouter();
  const { toast } = useToast();
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentView, setCurrentView] = useState<"mis-inspecciones" | "mis-reportes">("mis-inspecciones");
  
  const [inspector] = useState<Inspector>({
    nombre: "Inspector",
    email: "inspector@petran.cl",
    id: "INS-001",
  });

  useEffect(() => {
    const fetchInspecciones = async () => {
      try {
        const response = await fetch("/api/inspector/inspecciones/hoy");
        if (!response.ok) throw new Error("Error al cargar inspecciones");
        
        const data = await response.json();
        setInspecciones(data.data || []);

        if (data.data?.length === 0) {
          toast({
            title: "ℹ️ Sin inspecciones",
            description: "No tienes inspecciones programadas para hoy",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "❌ Error",
          description: "No se pudieron cargar tus inspecciones",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInspecciones();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/staff/logout", {
        method: "POST",
        credentials: "include",
      });
      router.replace("/");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="h-10 w-10 mx-auto" />
          <p className="text-stone-600">Cargando inspecciones...</p>
        </div>
      </main>
    );
  }

  const pendientes = inspecciones.filter(i => i.estado === "PROGRAMADA").length;
  const completadas = inspecciones.filter(i => i.estado === "COMPLETADA").length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-2.5 rounded-lg shadow-lg shadow-red-600/20">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-stone-900 font-bold text-xl">PETRAN</h1>
                <p className="text-stone-500 text-xs">Inspector Técnico</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-stone-100 p-2 rounded-lg transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-900">{inspector.nombre}</p>
                  <p className="text-xs text-stone-500">ID: {inspector.id}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-sm font-bold text-white">
                    {inspector.nombre.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-500" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-stone-200">
                    <p className="text-stone-900 font-medium">{inspector.nombre}</p>
                    <p className="text-stone-500 text-sm">{inspector.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full px-4 py-2 text-left hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-3 text-stone-900">
                      <Key className="w-4 h-4 text-stone-500" />
                      Cambiar Contraseña
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-3 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView("mis-inspecciones")}
              className={`px-6 py-4 font-medium transition-all flex items-center gap-2 ${
                currentView === "mis-inspecciones"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              Mis Inspecciones
            </button>
            <button
              onClick={() => setCurrentView("mis-reportes")}
              className={`px-6 py-4 font-medium transition-all flex items-center gap-2 ${
                currentView === "mis-reportes"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Camera className="w-4 h-4" />
              Mis Reportes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "mis-inspecciones" && (
          <>
            {/* Hero */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-transparent border border-blue-200 rounded-2xl p-8">
              <h1 className="text-4xl font-bold text-stone-900 mb-2">Mis Inspecciones Asignadas</h1>
              <p className="text-stone-600 text-lg">Inspecciones programadas para hoy y próximos días</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-stone-600 text-sm mb-1">Pendientes</h3>
                <p className="text-stone-900 text-3xl font-bold">{pendientes}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-stone-600 text-sm mb-1">Completadas Hoy</h3>
                <p className="text-stone-900 text-3xl font-bold">{completadas}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-stone-600 text-sm mb-1">Este Mes</h3>
                <p className="text-stone-900 text-3xl font-bold">{inspecciones.length}</p>
              </div>
            </div>

            {/* Lista de Inspecciones */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Programadas</h2>

              {inspecciones.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-stone-300 mb-4" />
                  <p className="text-lg font-semibold text-stone-900">Sin inspecciones programadas</p>
                  <p className="text-sm text-stone-600">Vuelve más tarde cuando haya nuevas inspecciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inspecciones.map((insp) => {
                    const estadoColor: Record<string, { bg: string; text: string; border: string }> = {
                      PROGRAMADA: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
                      EN_PROGRESO: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                      COMPLETADA: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
                    };

                    const colors = estadoColor[insp.estado] || estadoColor.PROGRAMADA;

                    return (
                      <div key={insp.id} className={`${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-md transition-all`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Camera className="w-8 h-8 text-blue-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-stone-900 font-bold text-lg">{insp.marca} {insp.modelo}</h3>
                                <span className="font-mono text-stone-600 text-sm">{insp.patente}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors.border} ${colors.text}`}>
                                  {insp.estado}
                                </span>
                              </div>
                              
                              <p className="text-stone-700 mb-3">{insp.empresa}</p>
                              
                              <div className="text-sm">
                                <div className="flex items-center gap-2 text-stone-600">
                                  <Clock className="w-4 h-4" />
                                  {new Date(insp.fecha_programada).toLocaleString("es-CL")}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => router.push(`/inspector/inspecciones?inspeccion_id=${insp.camion_id}`)}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20 font-medium whitespace-nowrap"
                            >
                              Iniciar Inspección
                            </button>
                            <button className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg transition-colors font-medium whitespace-nowrap">
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {currentView === "mis-reportes" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Mis Reportes</h2>
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-stone-300 mb-4" />
              <p className="text-lg font-semibold text-stone-900">Sin reportes completados</p>
              <p className="text-sm text-stone-600">Los reportes aparecerán aquí cuando completes inspecciones</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
