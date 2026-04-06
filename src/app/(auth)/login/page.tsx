import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; registered?: string }>;
}) {
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-white tracking-wider">
          Bienvenido
        </h1>
        <p className="text-white/40 font-body text-sm">
          Inicia sesión para continuar
        </p>
      </div>

      <LoginForm searchParams={searchParams} />
    </div>
  );
}
