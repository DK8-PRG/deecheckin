"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Reservation {
  id: string;
  propertyId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  // další pole dle potřeby
}

interface ReservationsContextType {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  addReservation: (data: Omit<Reservation, "id">) => Promise<void>;
  refresh: () => Promise<void>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(
  undefined
);

export const ReservationsProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("reservations").select();
      if (error) throw error;
      setReservations(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při načítání rezervací");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const addReservation = async (data: Omit<Reservation, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("reservations").insert([data]);
      if (error) throw error;
      await fetchReservations();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Chyba při přidávání rezervace"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReservationsContext.Provider
      value={{
        reservations,
        loading,
        error,
        addReservation,
        refresh: fetchReservations,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservationsContext = () => {
  const ctx = useContext(ReservationsContext);
  if (!ctx)
    throw new Error(
      "useReservationsContext must be used within ReservationsProvider"
    );
  return ctx;
};
