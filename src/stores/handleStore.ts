import { create } from "zustand";

interface HandleState {
  selectedHandles: string[];
  addHandle: (handleId: string) => void;
  removeHandle: (handleId: string) => void;
  resetHandles: () => void;
}

export const useHandleStore = create<HandleState>((set) => ({
  selectedHandles: [],
  addHandle: (handleId) =>
    set((state) => ({
      selectedHandles: [...state.selectedHandles, handleId],
    })),
  removeHandle: (handleId) =>
    set((state) => ({
      selectedHandles: state.selectedHandles.filter((id) => id !== handleId),
    })),
  resetHandles: () => set({ selectedHandles: [] }),
}));
