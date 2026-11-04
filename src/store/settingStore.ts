import { create } from 'zustand';
import api from '@/lib/axios';
import { Setting } from '@/types';

interface SettingState {
  settings: Setting | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingStore = create<SettingState>((set, get) => ({
  settings: null,
  isLoading: false,
  fetchSettings: async () => {
    if (get().settings) return; 
    
    set({ isLoading: true });
    try {
      const res = await api.get('/api/settings');
      
      if (res.data.success) {
        set({ settings: res.data.data });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));