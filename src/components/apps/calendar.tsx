"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  Tag,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  type CalendarEvent,
  INITIAL_CALENDAR_EVENTS,
  CALENDAR_CATEGORY_COLORS,
} from "@/lib/calendar-data";

function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarApp({ windowId }: { windowId: string }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("12:00 PM");
  const [newCategory, setNewCategory] = useState<CalendarEvent["category"]>("Work");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Calculate days in month and starting day offset
  const { calendarDays } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startIdx = firstDay.getDay();

    const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startIdx - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthLastDay - i,
        dateStr: "",
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = String(i).padStart(2, "0");
      const m = String(month + 1).padStart(2, "0");
      const dateStr = `${year}-${m}-${d}`;
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid to 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        dayNum: i,
        dateStr: "",
        isCurrentMonth: false,
      });
    }

    return { calendarDays: days };
  }, [year, month]);

  const selectedDateStr = useMemo(() => {
    return formatDateStr(selectedDate);
  }, [selectedDate]);

  const selectedEvents = useMemo(() => {
    return events.filter((e) => e.dateStr === selectedDateStr);
  }, [events, selectedDateStr]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dateStr: selectedDateStr,
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
    };

    setEvents((prev) => [...prev, newEvt]);
    setNewTitle("");
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const isToday = useCallback(
    (dayNum: number, isCurrentMonth: boolean) => {
      if (!isCurrentMonth) return false;
      const now = new Date();
      return (
        dayNum === now.getDate() &&
        month === now.getMonth() &&
        year === now.getFullYear()
      );
    },
    [month, year]
  );

  const isSelected = useCallback(
    (dayNum: number, isCurrentMonth: boolean) => {
      if (!isCurrentMonth) return false;
      return (
        dayNum === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear()
      );
    },
    [selectedDate, month, year]
  );

  const getEventsForDate = useCallback(
    (dateStr: string) => {
      if (!dateStr) return [];
      return events.filter((e) => e.dateStr === dateStr);
    },
    [events]
  );

  return (
    <div
      className="flex h-full w-full flex-col bg-background font-mono text-foreground text-xs select-none overflow-hidden"
      data-window-id={windowId}
    >
      {/* App Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-card/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary shadow-sm">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-wide">
            {monthNames[month]} {year}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-lg border border-border/50 transition-colors cursor-pointer active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetToday}
            className="px-3 py-1 text-xs font-semibold bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-lg border border-border/50 transition-colors cursor-pointer active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* Left Column: Month Grid */}
        <div className="w-full md:w-7/12 border-b md:border-b-0 md:border-r border-border/60 p-2.5 sm:p-3 flex flex-col gap-2 shrink-0 md:shrink md:overflow-hidden bg-card/10">
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground tracking-wider uppercase pb-1.5 border-b border-border/40 shrink-0">
            {daysOfWeek.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Flexible Days Grid */}
          <div className="flex-1 grid grid-cols-7 gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {calendarDays.map((item, idx) => {
              const active = isSelected(item.dayNum, item.isCurrentMonth);
              const today = isToday(item.dayNum, item.isCurrentMonth);
              const dayEvts = getEventsForDate(item.dateStr);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!item.isCurrentMonth}
                  onClick={() => {
                    if (item.isCurrentMonth) {
                      setSelectedDate(new Date(year, month, item.dayNum));
                    }
                  }}
                  className={`min-h-[48px] sm:min-h-[56px] p-1 sm:p-1.5 rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left relative group hover:scale-[1.02] ${
                    !item.isCurrentMonth
                      ? "opacity-20 cursor-default bg-background/20"
                      : active
                      ? "bg-primary/20 border-2 border-primary text-primary shadow-md shadow-primary/10 font-bold"
                      : today
                      ? "bg-card border-2 border-primary/80 text-foreground shadow-sm"
                      : "bg-card/40 hover:bg-primary/10 border border-border/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        today
                          ? "w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] shadow-sm"
                          : active
                          ? "text-primary font-extrabold"
                          : item.isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.dayNum}
                    </span>
                    {dayEvts.length > 0 && !active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Render Micro Event Pills inside Day Cell */}
                  {item.isCurrentMonth && dayEvts.length > 0 && (
                    <div className="space-y-0.5 mt-1 w-full">
                      {dayEvts.slice(0, 2).map((evt) => {
                        const style = CALENDAR_CATEGORY_COLORS[evt.category] || CALENDAR_CATEGORY_COLORS.Work;
                        return (
                          <div
                            key={evt.id}
                            className={`px-1 py-0.5 rounded text-[8px] font-semibold truncate border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvts.length > 2 && (
                        <div className="text-[8px] text-muted-foreground/80 font-bold text-right">
                          +{dayEvts.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schedule & Add Event Panel */}
        <div className="w-full md:w-5/12 p-3 flex flex-col gap-3 overflow-y-auto bg-card/30 scrollbar-thin">
          {/* Selected Date Banner */}
          <div className="p-3 bg-card/60 border border-border/60 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                SELECTED DATE
              </div>
              <div className="text-sm font-bold text-primary mt-0.5">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/15 text-primary border border-primary/30 shadow-sm">
              {selectedEvents.length} {selectedEvents.length === 1 ? "event" : "events"}
            </span>
          </div>

          {/* Events Schedule List */}
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin pr-1">
            {selectedEvents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground/60 space-y-2 bg-background/30 rounded-2xl border border-border/40">
                <Sparkles className="w-6 h-6 mx-auto text-muted-foreground/30" />
                <p className="text-xs font-semibold text-foreground/80">No events scheduled for this day</p>
                <p className="text-[10px] text-muted-foreground/50">
                  Use the form below to create a reminder or milestone.
                </p>
              </div>
            ) : (
              selectedEvents.map((evt) => {
                const style = CALENDAR_CATEGORY_COLORS[evt.category] || CALENDAR_CATEGORY_COLORS.Work;
                return (
                  <div
                    key={evt.id}
                    className="group relative p-3 bg-card/60 hover:bg-card border border-border/60 hover:border-primary/50 rounded-2xl flex flex-col gap-1.5 transition-all shadow-sm hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {evt.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 rounded-lg hover:bg-red-500/15 transition-all cursor-pointer"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3 text-primary" />
                        {evt.time}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {evt.category}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Event Form Card */}
          <form
            onSubmit={handleAddEvent}
            className="p-3.5 bg-card/60 border border-border/60 rounded-2xl space-y-2.5 shrink-0 shadow-sm"
          >
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center justify-between">
              <span>ADD EVENT</span>
              <Tag className="w-3 h-3 opacity-60" />
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Event title (e.g. AI Model Benchmark)..."
              className="w-full px-3 py-1.5 bg-background/60 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
            />

            <div className="flex gap-2">
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="Time (12:00 PM)"
                className="w-1/2 px-3 py-1.5 bg-background/60 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CalendarEvent["category"])}
                className="w-1/2 px-2.5 py-1.5 bg-background/60 border border-border/60 rounded-xl text-xs text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Project">Project</option>
                <option value="Milestone">Milestone</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
