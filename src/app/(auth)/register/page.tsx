import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl text-white tracking-wider">
          Crea tu cuenta
        </h1>
        <p className="text-white/40 font-body text-sm">
          Únete a Bull Weightlifting
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
