import { baseApi } from "./api/baseApi";
import localCartReducer from "./features/localCartSlice";
import authReducer from "./features/authSlice";

export const reducer = {
  [baseApi.reducerPath]: baseApi.reducer,
  localCart: localCartReducer,
  auth: authReducer,
};

