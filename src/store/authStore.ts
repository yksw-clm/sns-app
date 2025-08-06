import { create } from "zustand";

type AuthState = {
	isAuthenticated: boolean;
	isLoading: boolean;
	setIsAuthenticated: (value: boolean) => void;
	setIsLoading: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
	isLoading: true,
	setIsLoading: (isLoading) => set({ isLoading }),
}));
