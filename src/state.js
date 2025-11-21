// state.js
import { proxy } from 'valtio';

export const state = proxy({
  email: "",
  password: "",
  showPassword: false,
  errorMsg: "",
  loading: false,
});
