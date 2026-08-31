// src/store/index.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import languageReducer from "../i18n/store/languageSlice";
import userReducer from "../app/providers/userSlice";
import rankReducer from "../app/providers/rankSlice";
// 1) Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  language: languageReducer,
  rank: rankReducer,
});

// 2) Persist config
//    Option A: blacklist 'resume' so only user & job are persisted.
const persistConfig = {
  key: "root",
  storage,
  blacklist: ["resume"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      // resume slice keeps File objects (non-serializable) -> disable check
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// 4) Persistor
export const persistor = persistStore(store);
