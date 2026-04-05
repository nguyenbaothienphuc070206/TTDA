import { create } from "zustand";

export const useProgress = create((set) => ({
  items: [],
  setItems: (items) => set({ items: Array.isArray(items) ? items : [] }),
  markCompleteLocal: (lessonId) =>
    set((state) => {
      const safeLessonId = String(lessonId || "").trim();
      if (!safeLessonId) return state;

      const existed = state.items.some((x) => String(x.lesson_id || "") === safeLessonId);
      if (existed) {
        return {
          items: state.items.map((x) =>
            String(x.lesson_id || "") === safeLessonId
              ? { ...x, completed: true, updated_at: new Date().toISOString() }
              : x
          ),
        };
      }

      return {
        items: [
          ...state.items,
          { lesson_id: safeLessonId, completed: true, updated_at: new Date().toISOString() },
        ],
      };
    }),
}));
