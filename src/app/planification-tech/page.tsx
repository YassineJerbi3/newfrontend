// src/app/rapport/mes-planifications/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  ToolbarProps,
  EventProps,
} from "react-big-calendar";
import moment from "moment";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { motion } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const typeIcon = (type: string) => (type === "rapport" ? "📝" : "");
const eventStyleGetter = (event: any) => {
  const bgColor =
    event.priority === "Urgent"
      ? "#b91c1c"
      : event.priority === "Medium"
        ? "#d97706"
        : "#047857";
  return {
    style: {
      backgroundColor: bgColor,
      borderRadius: "1.25rem",
      border: "none",
      color: "#fff",
      padding: "6px 8px",
      fontSize: "0.85rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      transition: "transform 0.2s",
    },
  };
};

interface CustomToolbarProps extends ToolbarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: string;
  views: string[];
  onView: (view: string) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  label,
  onNavigate,
  currentDate,
  onDateChange,
  view,
  views,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3 text-white shadow-md backdrop-blur-sm">
      <div className="flex space-x-3">
        <button
          onClick={() => onNavigate("PREV")}
          aria-label="Précédent"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 transition hover:bg-opacity-30"
        >
          ←
        </button>
        <button
          onClick={() => {
            onNavigate("TODAY");
            onDateChange(new Date());
          }}
          className="rounded-full bg-white bg-opacity-25 px-4 py-2 text-sm font-medium transition hover:bg-opacity-35"
        >
          Aujourd’hui
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          aria-label="Suivant"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 transition hover:bg-opacity-30"
        >
          →
        </button>
      </div>

      <div className="relative">
        <span
          onClick={() => setShowPicker(true)}
          className="cursor-pointer select-none text-xl font-semibold"
        >
          {label}
        </span>
        {showPicker && (
          <div className="absolute left-1/2 top-full z-30 mt-2 w-[280px] -translate-x-1/2 transform rounded-xl bg-white p-4 shadow-2xl">
            <input
              type="month"
              value={moment(currentDate).format("YYYY-MM")}
              onChange={(e) => {
                const [year, month] = e.target.value.split("-");
                onDateChange(new Date(Number(year), Number(month) - 1));
                setShowPicker(false);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              v === view
                ? "bg-white text-blue-700"
                : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

const CalendarOnlyPage: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:2000/rapports/mes-planifies",
          { credentials: "include" },
        );
        if (!res.ok) {
          const text = await res.text();
          console.error("API error", res.status, text);
          setError(`Erreur serveur : ${res.status}`);
          return;
        }
        const data = await res.json();
        // Ne mappe que si c'est un tableau
        const list = Array.isArray(data) ? data : [];
        const evts = list.map((r: any) => {
          const planif = new Date(r.datePlanification);
          return {
            id: r.id,
            title: `Rapport #${r.id}`,
            start: planif,
            end: planif,
            priority:
              r.incident.priorite === "URGENT"
                ? "Urgent"
                : r.incident.priorite === "BASSE"
                  ? "Bas"
                  : "Medium",
            type: "rapport",
          };
        });
        setEvents(evts);
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Impossible de charger vos planifications");
      }
    })();
  }, []);

  return (
    <DefaultLayout>
      <div className="flex h-screen flex-col bg-gradient-to-b from-blue-50 to-white p-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}
        <div className="flex-1">
          {events.length === 0 && !error ? (
            <p className="mt-10 text-center text-gray-500">
              Aucune planification trouvée.
            </p>
          ) : (
            <Calendar
              localizer={localizer}
              date={date}
              view={view}
              onView={(v) => setView(v as "month" | "week")}
              onNavigate={(d) => d instanceof Date && setDate(d)}
              defaultView="month"
              views={["month", "week"]}
              events={events}
              style={{
                height: "100%",
                borderRadius: "1.5rem",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
              components={{
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    currentDate={date}
                    onDateChange={setDate}
                    view={view}
                    views={["month", "week"]}
                    onView={(v) => setView(v as "month" | "week")}
                  />
                ),
                event: (props: EventProps<any>) => {
                  const { event, title } = props;
                  return (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="flex items-center space-x-1 pl-3"
                    >
                      <span className="text-base">{typeIcon(event.type)}</span>
                      <span className="truncate text-sm font-semibold text-white">
                        {title}
                      </span>
                    </motion.div>
                  );
                },
              }}
              eventPropGetter={(e) => eventStyleGetter(e as any)}
              onSelectEvent={() => {}}
            />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CalendarOnlyPage;
