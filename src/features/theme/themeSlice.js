import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "whygram_theme";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "dark";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: getInitialTheme(), // "dark" | "light"
  },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY, action.payload);
      } catch {}
    },
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, state.mode);
      } catch {}
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;