"use client";
import { usePathname, useRouter } from "next/navigation";

const locales = [
  { code: "cs", label: "Čeština" },
  { code: "en", label: "English" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLocale;
    router.push("/" + segments.join("/"));
  };

  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={currentLocale}
      onChange={handleChange}
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
