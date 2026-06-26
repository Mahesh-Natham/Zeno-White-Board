import { create } from 'zustand';
import { ElementType } from '../types';

import { TOOLS } from '../config/constants';

export type ToolType = typeof TOOLS[keyof typeof TOOLS];

interface DefaultStyles {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  width?: number;
  height?: number;
  text?: string;
}

interface ToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  defaultStyles: DefaultStyles;
  setDefaultStyle: <K extends keyof DefaultStyles>(key: K, value: DefaultStyles[K]) => void;
}

const useToolStore = create<ToolState>((set) => ({
  activeTool: TOOLS.SELECT,
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  defaultStyles: {
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: 'sans-serif',
    textColor: '#000000',
  },
  setDefaultStyle: (key, value) => set((state) => ({
    defaultStyles: { ...state.defaultStyles, [key]: value }
  })),
}));

export default useToolStore;
