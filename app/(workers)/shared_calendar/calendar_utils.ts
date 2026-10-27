export type ShiftColor = "green" | "blue" | "orange";

export interface Shift {
  time: string;
  label: string;
  color: ShiftColor;
  extraCount?: number;
  location?: string;
  assignedWorkers?: string[];
}

// Sample data (Hardcoded for now)
export const SAMPLE_SHIFTS: Record<string, Shift> = {
  "2026-09-28": {
    time: "6:00 am - 5:00 pm",
    label: "Coating",
    color: "green",
    extraCount: 2,
    location: "Production Line A",
    assignedWorkers: ["Worker1", "Worker2", "Worker3"],
  },
  "2026-09-29": {
    time: "6:00 am - 5:00 pm",
    label: "Packaging",
    color: "blue",
    extraCount: 2,
    location: "Warehouse B",
    assignedWorkers: ["Worker1", "Worker2", "Worker3"],
  },
  "2026-09-30": {
    time: "6:00 am - 5:00 pm",
    label: "Mixing",
    color: "orange",
    extraCount: 2,
    location: "Production Line C",
    assignedWorkers: ["Worker1", "Worker2", "Worker3"],
  },
};

export const SHIFT_STYLES: Record<
  ShiftColor,
  { bg: string; border: string; text: string; badge: string }
> = {
  green: {
    bg: "bg-[#E5F8EC]",
    border: "border-[#1FAA59]",
    text: "text-[#1FAA59]",
    badge: "bg-[#1FAA59]",
  },
  blue: {
    bg: "bg-[#E6EFFD]",
    border: "border-[#0050D3]",
    text: "text-[#0050D3]",
    badge: "bg-[#0050D3]",
  },
  orange: {
    bg: "bg-[#FEF3E6]",
    border: "border-[#FD950F]",
    text: "text-[#FD950F]",
    badge: "bg-[#FD950F]",
  },
};

export const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THURS", "FRI", "SAT"];
export const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export interface Cell {
  day: number;
  monthOffset: -1 | 0 | 1;
  key: string;
}

export function buildMonthGrid(year: number, month: number): Cell[] {
  const startWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Cell[] = [];

  // leading days from previous month
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day, monthOffset: -1, key: toKey(y, m, day) });
  }

  // days in current month
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, monthOffset: 0, key: toKey(year, month, day) });
  }

  // trailing days to complete the final week
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: nextDay, monthOffset: 1, key: toKey(y, m, nextDay) });
    nextDay++;
  }

  return cells;
}

export function formatFullDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}