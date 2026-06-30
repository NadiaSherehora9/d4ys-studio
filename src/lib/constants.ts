export const trainers = [
  { id: "anastasiia", name: "Анастасія" },
  { id: "nadiia", name: "Надія" },
  { id: "veronika", name: "Вероніка" },
];

export const trainingTypes = [
  { value: "CHOREO", label: "CHOREO" },
  { value: "JAZZ-FUNK", label: "JAZZ-FUNK" },
];

export const sessionModes = [
  { value: "group", label: "Група" },
  { value: "personal", label: "Персональне" },
];

export const bookingStatusLabels: Record<string, string> = {
  pending: "В очікуванні",
  confirmed: "Підтверджено",
  canceled: "Скасовано",
  attended: "Відвідано",
};

export const bookingStatusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  canceled: "bg-red-500/10 text-red-500 border-red-500/30",
  attended: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};
