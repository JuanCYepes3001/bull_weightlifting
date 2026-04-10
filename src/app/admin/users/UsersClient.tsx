"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, X, Shield, User, ChevronDown, Plus } from "lucide-react";
import {
  updateUserRoleAction,
  createAdminUserAction,
  assignAdminRoleByEmailAction,
} from "@/app/actions/users";
import type { AdminUser } from "@/lib/queries/admin";

/* ─── Role badge ────────────────────────────────────────── */
function RoleBadge({ role }: { role: "user" | "admin" }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 font-body text-[9px] tracking-widest uppercase px-2 py-0.5 border border-crimson/30 bg-crimson/10 text-crimson">
      <Shield size={8} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 font-body text-[9px] tracking-widest uppercase px-2 py-0.5 border border-white/10 bg-white/5 text-white/40">
      <User size={8} /> Usuario
    </span>
  );
}

/* ─── Role toggle ───────────────────────────────────────── */
function RoleToggle({
  user,
  onUpdated,
}: {
  user: AdminUser;
  onUpdated: (profileId: string, role: "user" | "admin") => void;
}) {
  const [pending, startTransition] = useTransition();
  const newRole = user.role === "admin" ? "user" : "admin";
  const label   = user.role === "admin" ? "Quitar admin" : "Hacer admin";

  const toggle = () => {
    if (!confirm(`¿${label} a ${user.name ?? user.email}?`)) return;
    startTransition(async () => {
      const res = await updateUserRoleAction(user.profileId, newRole);
      if (!res.error) onUpdated(user.profileId, newRole);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`font-body text-[9px] tracking-widest uppercase px-2 py-1 border transition-colors disabled:opacity-40 ${
        user.role === "admin"
          ? "border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40"
          : "border-crimson/20 text-crimson/60 hover:text-crimson hover:border-crimson/40"
      }`}
    >
      {pending ? "…" : label}
    </button>
  );
}

/* ─── Create admin modal ────────────────────────────────── */
function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createAdminUserAction(form.email, form.password, form.name);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => { onCreated(); onClose(); }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-crimson mb-1">
              Nuevo usuario
            </p>
            <h2 className="font-horizon text-sm tracking-widest text-white uppercase">
              Crear Admin
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <p className="font-body text-sm text-green-400 text-center py-4">
            ✓ Administrador creado exitosamente
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "name",     label: "Nombre completo", type: "text",     placeholder: "Juan Pérez" },
              { key: "email",    label: "Correo",          type: "email",    placeholder: "admin@bull.com" },
              { key: "password", label: "Contraseña",      type: "password", placeholder: "Mínimo 6 caracteres" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
                />
              </div>
            ))}

            {error && (
              <p className="font-body text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 font-body text-xs tracking-widest uppercase py-2.5 bg-crimson hover:bg-crimson-light text-white transition-colors disabled:opacity-50"
              >
                {pending ? "Creando…" : "Crear administrador"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 font-body text-xs tracking-widest uppercase border border-white/10 text-white/40 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Assign admin by email modal ───────────────────────── */
function AssignAdminModal({ onClose, onAssigned }: { onClose: () => void; onAssigned: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await assignAdminRoleByEmailAction(email);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => { onAssigned(); onClose(); }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-crimson mb-1">
              Asignar rol
            </p>
            <h2 className="font-horizon text-sm tracking-widest text-white uppercase">
              Hacer Admin
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <p className="font-body text-sm text-green-400 text-center py-4">
            ✓ Rol de administrador asignado
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block font-body text-[9px] tracking-widest uppercase text-white/30 mb-1">
                Correo del usuario existente
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@correo.com"
                required
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
              />
            </div>
            {error && <p className="font-body text-xs text-red-400">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 font-body text-xs tracking-widest uppercase py-2.5 bg-crimson hover:bg-crimson-light text-white transition-colors disabled:opacity-50"
              >
                {pending ? "Asignando…" : "Asignar admin"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 font-body text-xs tracking-widest uppercase border border-white/10 text-white/40 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */

export default function UsersClient({ users: initialUsers }: { users: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  // Unique locations from addresses
  const locations = useMemo(() => {
    const cities = new Set<string>();
    users.forEach((u) => {
      (u.addresses ?? []).forEach((a) => {
        if (a.city) cities.add(a.city);
        if (a.department) cities.add(a.department);
      });
    });
    return [...cities].sort();
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          u.name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Role
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      // Location
      if (locationFilter) {
        const q = locationFilter.toLowerCase();
        const hasLoc = (u.addresses ?? []).some(
          (a) =>
            a.city?.toLowerCase() === q ||
            a.department?.toLowerCase() === q
        );
        if (!hasLoc) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, locationFilter]);

  const handleRoleUpdate = (profileId: string, role: "user" | "admin") => {
    setUsers((prev) =>
      prev.map((u) => (u.profileId === profileId ? { ...u, role } : u))
    );
  };

  const reload = () => window.location.reload();

  return (
    <>
      {showCreate && (
        <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={reload} />
      )}
      {showAssign && (
        <AssignAdminModal onClose={() => setShowAssign(false)} onAssigned={reload} />
      )}

      <div className="space-y-6">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 font-body text-xs tracking-widest uppercase px-4 py-2.5 bg-crimson hover:bg-crimson-light text-white transition-colors"
          >
            <Plus size={12} /> Crear admin
          </button>
          <button
            type="button"
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-1.5 font-body text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            <Shield size={12} /> Asignar admin a usuario existente
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full bg-white/5 border border-white/10 pl-9 pr-9 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Role filter */}
          <div className="flex gap-1">
            {(["all", "admin", "user"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`font-body text-[10px] tracking-widest uppercase px-3 py-2.5 border transition-colors ${
                  roleFilter === r
                    ? r === "admin"
                      ? "bg-crimson/10 border-crimson/30 text-crimson"
                      : "bg-white/5 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                {r === "all" ? "Todos" : r === "admin" ? "Admins" : "Usuarios"}
              </button>
            ))}
          </div>

          {/* Location filter */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 pl-3 pr-8 py-2.5 font-body text-sm text-white/60 focus:outline-none focus:border-crimson/60"
            >
              <option value="" className="bg-[#1a1a1a]">Todas las ubicaciones</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-[#1a1a1a]">
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-white/5 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {["Nombre", "Correo", "Teléfono", "Rol", "Registro", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-body text-[10px] tracking-[0.25em] uppercase text-white/30"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center font-body text-sm text-white/20"
                  >
                    No hay usuarios que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.profileId}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-white/80">
                        {user.name ?? "—"}
                      </p>
                      {(user.addresses ?? []).length > 0 && (
                        <p className="font-body text-[10px] text-white/25">
                          {(user.addresses[0] as any)?.city ?? ""}
                          {(user.addresses[0] as any)?.department
                            ? `, ${(user.addresses[0] as any).department}`
                            : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/50 max-w-[180px] truncate">
                      {user.email || "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/40">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white/30 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RoleToggle user={user} onUpdated={handleRoleUpdate} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="font-body text-[9px] text-white/20 uppercase tracking-widest">
          {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
          {roleFilter !== "all" && ` · ${roleFilter}`}
          {locationFilter && ` · ${locationFilter}`}
        </p>
      </div>
    </>
  );
}
