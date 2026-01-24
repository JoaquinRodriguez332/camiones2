import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { InspectorLoginForm } from "./login-form";

export default function InspectorLoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login Inspector</CardTitle>
          <CardDescription className="text-center">
            Acceso al panel de inspecciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InspectorLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}