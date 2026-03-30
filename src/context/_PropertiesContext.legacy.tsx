"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  getProperties,
  createProperty,
  updateProperty as updatePropertyDb,
  deleteProperty as deletePropertyDb,
} from "@/lib/db";

export interface Property {
  id: string;
  name: string;
  address?: string;
}

interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  addProperty: (data: Omit<Property, "id">) => Promise<void>;
  updateProperty: (
    id: string,
    data: Partial<Omit<Property, "id">>,
  ) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(
  undefined,
);

export const PropertiesProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProperties();
      setProperties(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při načítání jednotek");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const addProperty = useCallback(async (data: Omit<Property, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await createProperty(data);
      const freshData = await getProperties();
      setProperties(freshData || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při přidávání jednotky");
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePropertyFn = useCallback(
    async (id: string, data: Partial<Omit<Property, "id">>) => {
      setLoading(true);
      setError(null);
      try {
        await updatePropertyDb(id, data);
        const freshData = await getProperties();
        setProperties(freshData || []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Chyba při aktualizaci jednotky",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deletePropertyFn = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePropertyDb(id);
      const freshData = await getProperties();
      setProperties(freshData || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při mazání jednotky");
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      properties,
      loading,
      error,
      addProperty,
      updateProperty: updatePropertyFn,
      deleteProperty: deletePropertyFn,
      refresh: fetchProperties,
    }),
    [
      properties,
      loading,
      error,
      addProperty,
      updatePropertyFn,
      deletePropertyFn,
      fetchProperties,
    ],
  );

  return (
    <PropertiesContext.Provider value={contextValue}>
      {children}
    </PropertiesContext.Provider>
  );
};

export const usePropertiesContext = () => {
  const ctx = useContext(PropertiesContext);
  if (!ctx)
    throw new Error(
      "usePropertiesContext must be used within PropertiesProvider",
    );
  return ctx;
};
