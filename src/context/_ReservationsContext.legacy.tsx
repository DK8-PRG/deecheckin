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
import { getReservations, createReservation, ReservationData } from "@/lib/db";
import type { Reservation } from "../../types/BookingRowProps";

interface ReservationsContextType {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  addReservation: (data: ReservationData) => Promise<void>;
  refresh: () => Promise<void>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(
  undefined,
);

export const ReservationsProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReservations();
      setReservations(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při načítání rezervací");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const addReservation = useCallback(async (data: ReservationData) => {
    setLoading(true);
    setError(null);
    try {
      await createReservation(data);
      const freshData = await getReservations();
      setReservations(freshData || []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Chyba při přidávání rezervace",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      reservations,
      loading,
      error,
      addReservation,
      refresh: fetchReservations,
    }),
    [reservations, loading, error, addReservation, fetchReservations],
  );

  return (
    <ReservationsContext.Provider value={contextValue}>
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservationsContext = () => {
  const ctx = useContext(ReservationsContext);
  if (!ctx)
    throw new Error(
      "useReservationsContext must be used within ReservationsProvider",
    );
  return ctx;
};
