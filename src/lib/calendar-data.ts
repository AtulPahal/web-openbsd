export interface CalendarEvent {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  title: string;
  time: string;
  category: "Work" | "Personal" | "Project" | "Milestone";
}

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
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
  {
    id: "evt-5",
    dateStr: "2026-09-01",
    title: "Quarterly AI Research Review",
    time: "09:00 AM",
    category: "Milestone",
  },
  {
    id: "evt-6",
    dateStr: "2026-09-15",
    title: "YOLOv5 Vision Pipeline Optimization",
    time: "03:00 PM",
    category: "Project",
  },
];

export const CALENDAR_CATEGORY_COLORS: Record<
  CalendarEvent["category"],
  { bg: string; text: string; border: string; dot: string }
> = {
  Milestone: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  Work: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  Project: {
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
  Personal: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
};
