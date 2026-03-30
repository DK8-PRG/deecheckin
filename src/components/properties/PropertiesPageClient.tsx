"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Property } from "@/types/property";
import {
  createPropertyAction,
  updatePropertyAction,
  deletePropertyAction,
} from "@/actions/properties";
import { PropertiesTable } from "@/components/PropertiesTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PropertiesPageClientProps {
  initialProperties: Property[];
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function PropertiesPageClient({
  initialProperties,
}: Readonly<PropertiesPageClientProps>) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(
    null,
  );
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "" });
  const [addForm, setAddForm] = useState({ name: "", address: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMutationSuccess = () => {
    router.refresh();
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setEditForm({
      name: property.name,
      address: property.address || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingProperty || !editForm.name.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await updatePropertyAction(editingProperty.id, {
        name: editForm.name.trim(),
        address: editForm.address.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditingProperty(null);
      handleMutationSuccess();
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingProperty) return;
    setError(null);

    startTransition(async () => {
      const result = await deletePropertyAction(deletingProperty.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeletingProperty(null);
      handleMutationSuccess();
    });
  };

  const handleAdd = () => {
    if (!addForm.name.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createPropertyAction({
        name: addForm.name.trim(),
        address: addForm.address.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowAddModal(false);
      setAddForm({ name: "", address: "" });
      handleMutationSuccess();
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("accommodationUnits")}</h1>
        <Button
          onClick={() => {
            setShowAddModal(true);
            setAddForm({ name: "", address: "" });
          }}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {t("addProperty")}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <PropertiesTable
        properties={initialProperties}
        onEdit={handleEdit}
        onDelete={(p) => setDeletingProperty(p)}
        onView={(p) => setViewingProperty(p)}
      />

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t("addProperty")}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("name")}
            </label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("address")}
            </label>
            <input
              type="text"
              value={addForm.address}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, address: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isPending || !addForm.name.trim()}
            >
              {isPending ? "..." : t("save")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        title={t("edit")}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("name")}
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("address")}
            </label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, address: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingProperty(null)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isPending || !editForm.name.trim()}
            >
              {isPending ? "..." : t("save")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProperty}
        onClose={() => setDeletingProperty(null)}
        title={t("confirmDelete")}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("deleteConfirmMessage", {
              name: deletingProperty?.name ?? "",
            })}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingProperty(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "..." : t("delete")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingProperty}
        onClose={() => setViewingProperty(null)}
        title={viewingProperty?.name ?? ""}
        size="md"
      >
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">ID:</span>
            <span className="text-sm font-medium text-foreground">
              {viewingProperty?.id}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">{t("name")}:</span>
            <span className="text-sm font-medium text-foreground">
              {viewingProperty?.name}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">
              {t("address")}:
            </span>
            <span className="text-sm font-medium text-foreground">
              {viewingProperty?.address || "-"}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
