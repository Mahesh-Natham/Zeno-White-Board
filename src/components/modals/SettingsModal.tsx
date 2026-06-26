import { createPortal } from 'react-dom';
import useCanvasStore from '../../store/canvasStore';
import { TOOLS } from '../../config/constants';
import { X, MousePointerClick } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { clickShortcuts, updateClickShortcuts } = useCanvasStore();

  if (!isOpen) return null;

  const toolOptions = [
    { value: 'none', label: 'None (Disabled)' },
    { value: TOOLS.TEXT, label: 'Text' },
    { value: TOOLS.STICKY_NOTE, label: 'Sticky Note' },
    { value: TOOLS.RECTANGLE, label: 'Rectangle' },
    { value: TOOLS.CIRCLE, label: 'Circle' },
    { value: TOOLS.TRIANGLE, label: 'Triangle' },
    { value: TOOLS.RHOMBUS, label: 'Rhombus' },
    { value: TOOLS.LINE, label: 'Line' },
    { value: TOOLS.ARROW, label: 'Arrow' }
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center pointer-events-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-blue-500" />
            Mouse Shortcuts
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Left Double-Click</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tool created on empty canvas double-click</p>
              </div>
              <select
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium text-gray-700"
                value={clickShortcuts.leftDoubleClick}
                onChange={(e) => updateClickShortcuts({ leftDoubleClick: e.target.value })}
              >
                {toolOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Right Triple-Click</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tool created on fast triple right-click</p>
              </div>
              <select
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium text-gray-700"
                value={clickShortcuts.rightTripleClick}
                onChange={(e) => updateClickShortcuts({ rightTripleClick: e.target.value })}
              >
                {toolOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
