"use client";

import React from "react";
import type { Reservation } from "@/types/reservation";

interface DatabaseDebuggerProps {
  reservations: Reservation[];
}

export function DatabaseDebugger({ reservations }: DatabaseDebuggerProps) {
  const sampleReservation = reservations[0];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Database Structure Debug</h3>
      <p>
        <strong>Total reservations:</strong> {reservations.length}
      </p>

      {sampleReservation && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Sample reservation structure:</h4>
          <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(sampleReservation, null, 2)}
          </pre>

          <h4 className="font-semibold mb-2 mt-4">Available fields:</h4>
          <ul className="text-sm">
            {Object.entries(sampleReservation).map(([key, value]) => (
              <li key={key} className="mb-1">
                <strong>{key}:</strong> {typeof value}
                {value !== null && value !== undefined
                  ? ` (${JSON.stringify(value).substring(0, 50)}${
                      JSON.stringify(value).length > 50 ? "..." : ""
                    })`
                  : " (null/undefined)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
