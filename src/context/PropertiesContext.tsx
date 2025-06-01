"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Property {
  id: string;
  name: string;
  // další pole dle potřeby
}

interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  addProperty: (data: Omit<Property, "id">) => Promise<void>;
  refresh: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(
  undefined
);

export const PropertiesProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("properties").select();
      if (error) throw error;
      setProperties(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při načítání jednotek");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (data: Omit<Property, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("properties").insert([data]);
      if (error) throw error;
      await fetchProperties();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při přidávání jednotky");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        loading,
        error,
        addProperty,
        refresh: fetchProperties,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
};

export const usePropertiesContext = () => {
  const ctx = useContext(PropertiesContext);
  if (!ctx)
    throw new Error(
      "usePropertiesContext must be used within PropertiesProvider"
    );
  return ctx;
};
