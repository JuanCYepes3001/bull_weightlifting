import { getAdminUsers } from "@/lib/queries/admin";
import UsersClient from "./UsersClient";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios | Admin" };

export default async function AdminUsersPage() {
  const users = await getAdminUsers().catch(() => []);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount  = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-[10px] tracking-[0.4em] text-crimson uppercase mb-1">
            Comunidad
          </p>
          <h1 className="text-2xl text-white flex items-center gap-3">
            USUARIOS
            <Users size={18} className="text-white/20" />
          </h1>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 text-right">
          <div>
            <p className="font-bebas text-2xl tracking-wider text-white/70">{users.length}</p>
            <p className="font-body text-[9px] tracking-widest uppercase text-white/25">Total</p>
          </div>
          <div>
            <p className="font-bebas text-2xl tracking-wider text-crimson">{adminCount}</p>
            <p className="font-body text-[9px] tracking-widest uppercase text-white/25">Admins</p>
          </div>
          <div>
            <p className="font-bebas text-2xl tracking-wider text-white/40">{userCount}</p>
            <p className="font-body text-[9px] tracking-widest uppercase text-white/25">Usuarios</p>
          </div>
        </div>
      </div>

      <UsersClient users={users} />
    </div>
  );
}
