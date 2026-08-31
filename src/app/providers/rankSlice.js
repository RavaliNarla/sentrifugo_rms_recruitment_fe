import { createSlice } from "@reduxjs/toolkit";

const rankSlice = createSlice({
  name: "rank",
  initialState: {
    isRankEnabled: false,
    isScoreEnabled: false, // 🔥 ADD THIS
  },
  reducers: {
    setRankEnabled: (state, action) => {
      state.isRankEnabled = action.payload;
    },
    setScoreEnabled: (state, action) => {
      state.isScoreEnabled = action.payload;
    },
    clearRankState: (state) => {
      state.isRankEnabled = false;
      state.isScoreEnabled = false;
    },
  },
});

export const { setRankEnabled, setScoreEnabled, clearRankState } =
  rankSlice.actions;
export default rankSlice.reducer;
