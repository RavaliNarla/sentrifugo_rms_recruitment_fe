import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: null,
  email: null,
  role: null,
  employeeId: null,
  privileges: {},
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { id, name, email, role, employeeId, privileges } = action.payload;
      state.id = id;
      state.name = name;
      state.email = email;
      state.role = role;
      state.employeeId = employeeId || null;
      state.privileges = privileges || {};
      state.isAuthenticated = true;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
