"use client";

import { useState } from "react";
import { Trash2, MapPin } from "lucide-react";
import type { Address } from "@/types";
import { deleteAddressAction } from "@/app/actions/profile";

interface AddressCardProps {
  address: Address;
}

export function AddressCard({ address }: AddressCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteAddressAction(address.id);
    setDeleting(false);
  };

  return (
    <div className={`border p-5 space-y-2 transition-colors ${address.is_default ? "border-crimson/40" : "border-white/5"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-crimson shrink-0 mt-0.5" />
          <h3 className="font-heading text-sm text-white tracking-wider">{address.label.toUpperCase()}</h3>
          {address.is_default && (
            <span className="font-impact text-[9px] tracking-widest text-crimson uppercase">
              Principal
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-50"
          aria-label="Eliminar dirección"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="font-body text-sm text-white/40 leading-relaxed pl-5">
        <p>{address.street}</p>
        <p>{address.city}, {address.department}</p>
        {address.zip_code && <p>{address.zip_code}</p>}
      </div>
    </div>
  );
}
