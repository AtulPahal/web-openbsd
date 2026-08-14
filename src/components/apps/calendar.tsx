"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Tag,
  Sparkles,
  Trash2,
} from "lucide-react";

interface EventItem {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  title: string;
  time: string;
  category: "Work" | "Personal" | "Project" | "Milestone";
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    dateStr: "2026-08-14",
    title: "OpenBSD Web Desktop Release",
    time: "10:00 AM",
    category: "Milestone",
  },
  {
    id: "evt-2",
    dateStr: "2026-08-14",
    title: "AI/ML Real-time Inference Review",
    time: "02:30 PM",
    category: "Work",
  },
  {
    id: "evt-3",
    dateStr: "2026-08-18",
    title: "Precision Agriculture Model Evaluation",
    time: "11:00 AM",
    category: "Project",
  },
  {
    id: "evt-4",
    dateStr: "2026-08-22",
    title: "ONNX Runtime Web Benchmark Run",
    time: "04:00 PM",
    category: "Work",
  },
];

export function CalendarApp({ windowId }: { windowId: string }) {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 14)); // Aug 14, 2026
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 7, 14));
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("12:00 PM");
  const [newCategory, setNewCategory] = useState<EventItem["category"]>("Work");

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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate days in month and starting day offset
  const { calendarDays, firstDayIndex } = useMemo(() => {
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
      const d = i < 10 ? `0${i}` : `${i}`;
      const m = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
      const dateStr = `${year}-${m}-${d}`;
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
      });
    }

    return { calendarDays: days, firstDayIndex: startIdx };
  }, [year, month]);

  const selectedDateStr = useMemo(() => {
    const d = selectedDate.getDate() < 10 ? `0${selectedDate.getDate()}` : `${selectedDate.getDate()}`;
    const m = selectedDate.getMonth() + 1 < 10 ? `0${selectedDate.getMonth() + 1}` : `${selectedDate.getMonth() + 1}`;
    return `${selectedDate.getFullYear()}-${m}-${d}`;
  }, [selectedDate]);

  const selectedEvents = useMemo(() => {
    return events.filter((e) => e.dateStr === selectedDateStr);
  }, [events, selectedDateStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToday = () => {
    const today = new Date(2026, 7, 14);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvt: EventItem = {
      id: `evt-${Date.now()}`,
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

  const isToday = (dayNum: number, isCurrentMonth: boolean) => {
    return isCurrentMonth && dayNum === 14 && month === 7 && year === 2026;
  };

  const isSelected = (dayNum: number, isCurrentMonth: boolean) => {
    return (
      isCurrentMonth &&
      dayNum === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const hasEventOnDate = (dateStr: string) => {
    if (!dateStr) return false;
    return events.some((e) => e.dateStr === dateStr);
  };

  return (
    <div
      className="flex h-full w-full flex-col bg-background font-mono text-foreground text-xs select-none"
      data-window-id={windowId}
    >
      {/* Top App Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/40">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs text-foreground">
            {monthNames[month]} {year}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-amber-500/20 text-muted-foreground hover:text-amber-300 rounded border border-border/40 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetToday}
            className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-amber-500/20 text-muted-foreground hover:text-amber-300 rounded border border-border/40 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Month Grid */}
        <div className="w-7/12 border-r border-border/60 p-3 flex flex-col gap-2 overflow-y-auto">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground uppercase pb-1 border-b border-border/40">
            {daysOfWeek.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const active = isSelected(item.dayNum, item.isCurrentMonth);
              const today = isToday(item.dayNum, item.isCurrentMonth);
              const hasEvents = hasEventOnDate(item.dateStr);

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
                  className={`h-10 rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    !item.isCurrentMonth
                      ? "opacity-20 cursor-default"
                      : active
                      ? "bg-amber-500/25 border-2 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10"
                      : today
                      ? "bg-amber-500 text-black font-bold shadow"
                      : "bg-card/40 hover:bg-amber-500/10 border border-border/40 text-foreground"
                  }`}
                >
                  <span className="text-xs">{item.dayNum}</span>
                  {hasEvents && item.isCurrentMonth && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                        today ? "bg-black" : "bg-amber-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Agenda Schedule & Add Event */}
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto bg-card/20">
          {/* Selected Date Header */}
          <div className="p-2.5 bg-card/60 border border-border/60 rounded-lg flex items-center justify-between">
            <div className="font-bold text-amber-400">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {selectedEvents.length} events
            </span>
          </div>

          {/* Events List */}
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
            {selectedEvents.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground/60 space-y-1 bg-background/30 rounded-lg border border-border/40">
                <Sparkles className="w-5 h-5 mx-auto text-muted-foreground/30" />
                <p className="text-xs">No events scheduled</p>
              </div>
            ) : (
              selectedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="group p-2.5 bg-card/60 hover:bg-card border border-border/60 rounded-lg flex flex-col gap-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate max-w-[180px]">
                      {evt.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity p-0.5"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {evt.time}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {evt.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Event Form */}
          <form
            onSubmit={handleAddEvent}
            className="p-2.5 bg-card/50 border border-border/60 rounded-lg space-y-2 shrink-0"
          >
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Add Event
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Event title..."
              className="w-full px-2 py-1 bg-background/60 border border-border/60 rounded text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-amber-400"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="Time (e.g. 2:00 PM)"
                className="w-1/2 px-2 py-1 bg-background/60 border border-border/60 rounded text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-amber-400"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as EventItem["category"])}
                className="w-1/2 px-2 py-1 bg-background/60 border border-border/60 rounded text-xs text-foreground outline-none focus:border-amber-400"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Project">Project</option>
                <option value="Milestone">Milestone</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1"
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
