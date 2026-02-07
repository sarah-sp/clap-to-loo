"use client";

import { useState, useEffect, useCallback } from "react";

interface TrainService {
  std: string;
  etd: string;
  platform: string | null;
  destination: { locationName: string }[];
  operator: string;
}

interface DeparturesData {
  trainServices: TrainService[];
  locationName: string;
  generatedAt: string;
  direction: string;
  error?: string;
}

function getMinutesUntil(std: string, etd: string, generatedAt: string): number | null {
  if (!generatedAt) return null;

  // Use expected time if it's a valid time (e.g., "12:44"), otherwise use scheduled time
  const timeStr = /^\d{2}:\d{2}$/.test(etd) ? etd : std;

  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const apiTime = new Date(generatedAt);
  const departure = new Date(apiTime);
  departure.setHours(hours, minutes, 0, 0);

  const diffMs = departure.getTime() - apiTime.getTime();
  return Math.round(diffMs / 60000);
}

function shortenDestination(name: string): string {
  return name
    .replace("London Waterloo", "Waterloo")
    .replace("London ", "")
    .replace("Clapham Junction", "Clapham Jct");
}

export default function DepartureBoard() {
  const [data, setData] = useState<DeparturesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>("10");
  const [direction, setDirection] = useState<string>("to-waterloo");
  const [, setTick] = useState(0);

  const fetchDepartures = useCallback(async () => {
    try {
      const response = await fetch(`/api/departures?direction=${direction}`);
      if (!response.ok) {
        throw new Error("Failed to fetch departures");
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [direction]);

  useEffect(() => {
    setLoading(true);
    fetchDepartures();

    let interval: NodeJS.Timeout | null = null;

    const startRefresh = () => {
      if (!interval) {
        interval = setInterval(fetchDepartures, 60000);
      }
    };

    const stopRefresh = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopRefresh();
      } else {
        fetchDepartures(); // Refresh immediately when coming back
        startRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startRefresh();

    return () => {
      stopRefresh();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchDepartures]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (etd: string) => {
    const status = etd.toLowerCase();
    if (status === "cancelled") return "bg-[#E1251B] text-white px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm font-bold";
    if (status === "delayed" || status.includes("exp") || /^\d{2}:\d{2}$/.test(etd)) return "bg-[#FFCD00] text-black px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm font-semibold";
    if (status === "on time") return "text-[#00FF5A] text-xs sm:text-sm font-semibold";
    return "text-xs sm:text-sm";
  };

  const watToCljPlatforms = ["1", "2", "3", "4", "5", "6"];

  const platforms = data?.trainServices
    ? [...new Set(data.trainServices.map((s) => s.platform).filter(Boolean))]
        .filter((p) => direction === "to-waterloo" || watToCljPlatforms.includes(p!))
        .sort((a, b) => parseInt(a!) - parseInt(b!))
    : [];

  const filteredServices = data?.trainServices?.filter((service) => {
    if (direction === "to-clapham" && service.platform && !watToCljPlatforms.includes(service.platform)) {
      return false;
    }
    return platformFilter === "all" || service.platform === platformFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="text-lg sm:text-xl text-white/80">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#E1251B] rounded-lg p-3 sm:p-4">
        <h2 className="font-bold text-base sm:text-lg">Error</h2>
        <p className="text-white/90 text-sm">{error}</p>
        <button
          onClick={fetchDepartures}
          className="mt-3 px-4 py-2 bg-white text-[#E1251B] rounded font-bold hover:bg-white/90 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Direction Toggle - Segmented Control */}
      <div className="bg-[#001840] p-1 rounded-full flex mb-3">
        <button
          onClick={() => {
            setDirection("to-waterloo");
            setPlatformFilter("10");
          }}
          className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
            direction === "to-waterloo"
              ? "bg-white text-[#003688]"
              : "text-white/70 active:bg-white/10"
          }`}
        >
          To Waterloo
        </button>
        <button
          onClick={() => {
            setDirection("to-clapham");
            setPlatformFilter("all");
          }}
          className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
            direction === "to-clapham"
              ? "bg-white text-[#003688]"
              : "text-white/70 active:bg-white/10"
          }`}
        >
          To Clapham Jct
        </button>
      </div>

      {/* Platform Pills */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setPlatformFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            platformFilter === "all"
              ? "bg-white text-[#003688]"
              : "bg-[#001840] text-white/70 active:bg-[#002255]"
          }`}
        >
          All
        </button>
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setPlatformFilter(platform!)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              platformFilter === platform
                ? "bg-white text-[#003688]"
                : "bg-[#001840] text-white/70 active:bg-[#002255]"
            }`}
          >
            Plat {platform}
          </button>
        ))}
      </div>

      {/* Departure List */}
      <div className="bg-[#001840] rounded-2xl overflow-hidden">
        {/* Column Headers */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#002255] text-white/60 text-[10px] uppercase tracking-wide font-medium">
          <div className="w-14 shrink-0">Due</div>
          <div className="flex-1">Destination</div>
          <div className="w-7 text-center shrink-0">Plat</div>
          <div className="w-16 text-right shrink-0">Status</div>
        </div>
        {filteredServices && filteredServices.length > 0 ? (
          <div className="divide-y divide-white/10">
            {filteredServices.map((service, index) => {
              const mins = getMinutesUntil(service.std, service.etd, data?.generatedAt || "");
              return (
                <div
                  key={`${service.std}-${index}`}
                  className="flex items-center gap-3 px-3 py-2.5 active:bg-white/5"
                >
                  {/* Time */}
                  <div className="w-14 shrink-0">
                    <div className={`font-mono text-xl font-bold ${mins !== null && mins < 0 ? "text-white/40" : "text-white"}`}>
                      {mins !== null ? (mins < 0 ? `${mins}` : mins === 0 ? "Due" : `${mins}`) : service.std}
                    </div>
                    <div className="text-white/40 text-[10px]">{mins !== null && mins !== 0 ? "min" : ""}</div>
                  </div>

                  {/* Destination & time */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {shortenDestination(service.destination?.[0]?.locationName || "Unknown")}
                    </div>
                    <div className="text-white/40 text-[10px]">{service.std}</div>
                  </div>

                  {/* Platform */}
                  {service.platform ? (
                    <span className="bg-white text-[#003688] font-bold w-7 h-7 leading-7 rounded text-center text-sm shrink-0">
                      {service.platform}
                    </span>
                  ) : (
                    <span className="w-7 text-center text-white/30 shrink-0">-</span>
                  )}

                  {/* Status */}
                  <div className="w-16 text-right shrink-0">
                    <span className={getStatusStyle(service.etd)}>
                      {service.etd}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-white/50">
            No departures found
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 text-[10px] sm:text-xs text-white/40">
        <span>Auto-refreshes every 60s</span>
        <span>{data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : ""}</span>
      </div>
    </div>
  );
}
