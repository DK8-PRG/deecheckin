"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { DataTable, ColumnDef, ActionButton } from "@/components/ui/DataTable";
import { Property } from "@/types/property";

interface PropertiesTableProps {
  properties: Property[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onView?: (property: Property) => void;
}

export function PropertiesTable({
  properties,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onView,
}: Readonly<PropertiesTableProps>) {
  const t = useTranslations();

  // Výchozí handlery
  const handleEdit =
    onEdit ||
    ((property: Property) => {
      console.log("Edit property:", property);
    });

  const handleDelete =
    onDelete ||
    ((property: Property) => {
      console.log("Delete property:", property);
    });

  const handleView =
    onView ||
    ((property: Property) => {
      console.log("View property:", property);
    });

  // Funkce pro kliknutí na řádek
  const handleRowClick = (property: Property) => {
    handleView(property);
  };

  // Definice sloupců
  const columns: ColumnDef<Property>[] = [
    {
      key: "id",
      header: "ID",
      accessor: (item) => String(item.id),
      sortable: true,
      filterable: true,
      width: "100px",
    },
    {
      key: "name",
      header: t("name"),
      accessor: (item) => item.name,
      sortable: true,
      filterable: true,
    },
  ];

  // Definice akcí
  const actions: ActionButton<Property>[] = [
    {
      label: t("view"),
      onClick: (property) => handleView(property),
      variant: "primary",
    },
    {
      label: t("edit"),
      onClick: (property) => handleEdit(property),
      variant: "secondary",
    },
    {
      label: t("delete"),
      onClick: (property) => handleDelete(property),
      variant: "danger",
    },
  ];

  return (
    <DataTable
      data={properties}
      columns={columns}
      actions={actions}
      onRowClick={handleRowClick}
      loading={loading}
      error={error}
      emptyMessage={t("noProperties")}
      pageSize={20}
    />
  );
}
