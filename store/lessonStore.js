import { create } from "zustand";

export const useLessonStore = create((set) => ({
  lessons: [],
  setLessons: (lessons) => set({ lessons: Array.isArray(lessons) ? lessons : [] }),
  clearLessons: () => set({ lessons: [] }),
}));
