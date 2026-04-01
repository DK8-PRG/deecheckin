"use client";

import React from "react";
import type { Property } from "@/types/property";
import { MapPin, Home } from "lucide-react";

interface PropertyHeroProps {
  property: Property;
}

export function PropertyHero({ property }: Readonly<PropertyHeroProps>) {
  const googleMapsUrl = property.address
    ? `https://maps.google.com/?q=${encodeURIComponent(property.address)}`
    : null;
  const mapyCzUrl = property.address
    ? `https://mapy.cz/zakladni?q=${encodeURIComponent(property.address)}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-12 text-center text-white shadow-lg">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full bg-white" />
      </div>

      <div className="relative space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm mb-2">
          <Home className="h-7 w-7 text-white" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {property.name}
        </h1>

        {property.address && (
          <div className="flex items-center justify-center gap-1.5 text-blue-100">
            <MapPin className="h-4 w-4 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {googleMapsUrl ? (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2"
                >
                  {property.address}
                </a>
              ) : (
                <span>{property.address}</span>
              )}
              {mapyCzUrl && (
                <a
                  href={mapyCzUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-colors"
                >
                  Mapy.cz
                </a>
              )}
            </div>
          </div>
        )}

        {property.description && (
          <p className="max-w-2xl mx-auto text-blue-100 leading-relaxed mt-2">
            {property.description}
          </p>
        )}
      </div>
    </div>
  );
}
