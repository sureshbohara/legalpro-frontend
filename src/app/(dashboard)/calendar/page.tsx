"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "@/lib/axios";
import { Calendar as CalendarIcon, Filter, Loader2 } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";



export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });


  const [filters, setFilters] = useState({
    hearings: true,
    tasks: true,
    invoices: true,
  });

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/api/calendar/events", {
          params: {
            start: dateRange.start,
            end: dateRange.end,
          },
        });
        if (res.data.success) {
          setEvents(res.data.data);
        }
      } catch (error) {
        console.error("Calendar fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [dateRange]); 

  const getFilteredEvents = () => {
    return events.filter((event: any) => {
      if (event.type === 'hearing' && !filters.hearings) return false;
      if (event.type === 'task' && !filters.tasks) return false;
      if (event.type === 'invoice' && !filters.invoices) return false;
      return true;
    });
  };

  const handleEventClick = (info: any) => {
    if (info.event.url) {
      info.jsEvent.preventDefault(); 
      router.push(info.event.url);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Calendar" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Calendar" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-green-600" /> Schedule & Deadlines
          </h2>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={filters.hearings} onChange={(e) => setFilters({...filters, hearings: e.target.checked})} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                <span className="text-gray-700 dark:text-gray-300">Hearings</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={filters.tasks} onChange={(e) => setFilters({...filters, tasks: e.target.checked})} className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Tasks</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={filters.invoices} onChange={(e) => setFilters({...filters, invoices: e.target.checked})} className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Invoices</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 min-h-[600px] relative custom-calendar-wrapper">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          )}
          
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            events={getFilteredEvents()}
            datesSet={(dateInfo) => {
              setDateRange({ start: dateInfo.startStr, end: dateInfo.endStr });
            }}
            eventClick={handleEventClick}
            height="auto"
            editable={false}
            selectable={true}
            dayMaxEvents={3}
            dayHeaderFormat={{ weekday: 'short' }}
            titleFormat={{ year: 'numeric', month: 'long' }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-calendar-wrapper .fc {
          font-family: inherit;
          color: #1f2937;
        }
        .dark .custom-calendar-wrapper .fc {
          color: #f8fafc;
        }
        .custom-calendar-wrapper .fc-theme-standard td, 
        .custom-calendar-wrapper .fc-theme-standard th {
          border-color: #e5e7eb;
        }
        .dark .custom-calendar-wrapper .fc-theme-standard td, 
        .dark .custom-calendar-wrapper .fc-theme-standard th {
          border-color: #334155;
        }
        .custom-calendar-wrapper .fc .fc-button-primary {
          background-color: #16a34a;
          border-color: #16a34a;
        }
        .custom-calendar-wrapper .fc .fc-button-primary:hover {
          background-color: #15803d;
        }
        .custom-calendar-wrapper .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #166534;
        }
        .custom-calendar-wrapper .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(22, 163, 74, 0.05);
        }
        .custom-calendar-wrapper .fc .fc-col-header-cell-cushion {
          padding: 8px 4px;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .custom-calendar-wrapper .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.75rem;
          cursor: pointer;
          border: none !important;
        }
        .custom-calendar-wrapper .fc-event:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}