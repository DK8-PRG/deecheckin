import AdminSidebar from "../../../../components/AdminSidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabaseClient";

export default async function PropertiesPage() {
  const t = await getTranslations();
  // Načtení dat z tabulky 'properties'
  const { data: properties, error } = await supabase
    .from("properties")
    .select();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="w-full flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("accommodationUnits")}</h1>
        <div className="border rounded p-4">
          {error && <div className="text-red-500">{error.message}</div>}
          <ul className="list-disc pl-6">
            {properties?.length ? (
              properties.map((p: { id: string; name: string }) => (
                <li key={p.id}>{p.name}</li>
              ))
            ) : (
              <li className="text-gray-500">Žádné jednotky</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
