import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AddressForm } from "@/components/profile/AddressForm";
import { AddressCard } from "@/components/profile/AddressCard";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { Button } from "@/components/ui/Button";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import Link from "next/link";
import type { Address } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { user, profile } = await requireAuth();
  const addresses: Address[] = (profile?.addresses as Address[]) ?? [];
  const { welcome } = await searchParams;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-14">

      {/* Welcome banner for new Google users */}
      {welcome === "1" && (
        <div className="border border-crimson/40 bg-crimson/10 px-5 py-4 space-y-1">
          <p className="font-heading text-sm tracking-widest uppercase text-crimson">¡Bienvenido!</p>
          <p className="font-body text-sm text-white/70">
            Tu cuenta de Google fue vinculada correctamente. Completa tu dirección de envío y teléfono para poder realizar pedidos.
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-3xl md:text-4xl text-white">MI PERFIL</h1>
        {profile?.role === "admin" && (
          <span className="inline-block mt-2 font-impact text-xs tracking-widest text-crimson uppercase">
            Administrador
          </span>
        )}
      </div>

      {/* Sección datos personales */}
      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl">DATOS PERSONALES</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <ProfileForm
          name={profile?.name ?? null}
          phone={profile?.phone ?? null}
          email={user.email ?? ""}
        />
      </section>

      {/* Sección direcciones */}
      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl">DIRECCIONES</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {addresses.length === 0 && (
          <p className="font-body text-sm text-white/30">
            Aún no tienes direcciones guardadas.
          </p>
        )}

        <div className="space-y-3">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} address={addr} />
          ))}
        </div>

        <AddressForm />
      </section>

      {/* Links rápidos */}
      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl">MIS PEDIDOS</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <Link
          href="/profile/orders"
          className="font-body text-sm text-white/40 hover:text-white transition-colors"
        >
          Ver historial de pedidos →
        </Link>
      </section>

      {/* Cambiar contraseña */}
      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl">CONTRASEÑA</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <p className="font-body text-sm text-white/30">
          Actualiza tu contraseña. Necesitarás ingresar la contraseña actual para confirmar.
        </p>
        <ChangePasswordForm />
      </section>

      {/* Cerrar sesión */}
      <section className="border-t border-white/5 pt-8 space-y-6">
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </section>

      {/* Eliminar cuenta */}
      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <h2 className="text-white/50 text-xl">ZONA DE PELIGRO</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <p className="font-body text-sm text-white/30">
          Eliminar tu cuenta es una acción permanente e irreversible.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
