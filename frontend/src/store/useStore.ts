import { create } from "zustand";
import type { PhotoSpec } from "../utils/specData";

export type ProcessMode = "server" | "localhd";

interface AppState {
  originalImage: File | null;
  originalImageUrl: string | null;
  setOriginalImage: (file: File | null) => void;

  selectedCountry: string;
  selectedSpec: PhotoSpec | null;
  setSelectedCountry: (code: string) => void;
  setSelectedSpec: (spec: PhotoSpec | null) => void;

  backgroundColor: string;
  setBackgroundColor: (color: string) => void;

  processMode: ProcessMode;
  setProcessMode: (mode: ProcessMode) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;

  resultImageUrl: string | null;
  setResultImageUrl: (url: string | null) => void;
  error: string | null;
  setError: (err: string | null) => void;

  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  originalImage: null,
  originalImageUrl: null,
  setOriginalImage: (file) =>
    set({
      originalImage: file,
      originalImageUrl: file ? URL.createObjectURL(file) : null,
      resultImageUrl: null,
      error: null,
    }),

  selectedCountry: "CN",
  selectedSpec: null,
  setSelectedCountry: (code) => set({ selectedCountry: code, selectedSpec: null }),
  setSelectedSpec: (spec) => set({ selectedSpec: spec }),

  backgroundColor: "#FFFFFF",
  setBackgroundColor: (color) => set({ backgroundColor: color }),

  processMode: "server",
  setProcessMode: (mode) => set({ processMode: mode }),

  isProcessing: false,
  setIsProcessing: (v) => set({ isProcessing: v }),

  resultImageUrl: null,
  setResultImageUrl: (url) => set({ resultImageUrl: url }),

  error: null,
  setError: (err) => set({ error: err }),

  reset: () =>
    set({
      originalImage: null,
      originalImageUrl: null,
      resultImageUrl: null,
      error: null,
      selectedSpec: null,
    }),
}));
