import React, { useState } from 'react';
import useUiStore from '../../store/uiStore';
import useCanvasStore from '../../store/canvasStore';
import { TOOLS } from '../../config/constants';
import useAuthStore from '../../store/authStore';
import { createDefaultElement } from '../../utils/elementFactory';
import useToolStore from '../../store/toolStore';
import { X, AppWindow } from 'lucide-react';

export default function EmbedUrlModal() {
  const embedModalOpen = useUiStore(state => state.embedModalOpen);
  const embedCoordinates = useUiStore(state => state.embedCoordinates);
  const closeEmbedModal = useUiStore(state => state.closeEmbedModal);
  
  const addElement = useCanvasStore(state => state.addElement);
  const defaultStyles = useToolStore(state => state.defaultStyles);
  const setActiveTool = useToolStore(state => state.setActiveTool);
  const userProfile = useAuthStore(state => state.userProfile);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  if (!embedModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    let parsedUrl = url.trim();
    // Automatically convert standard Google Docs/Sheets/Slides /edit links to /preview
    if (parsedUrl.includes('docs.google.com') && parsedUrl.includes('/edit')) {
      parsedUrl = parsedUrl.replace('/edit', '/preview');
    }
    
    if (embedCoordinates) {
      const userId = userProfile?.uid || 'anonymous';
      const newElement = createDefaultElement(
        TOOLS.GOOGLE_WORKSPACE,
        embedCoordinates.x,
        embedCoordinates.y,
        userId,
        defaultStyles
      );
      
      // Override with custom workspace payload
      newElement.url = parsedUrl;
      newElement.width = 900;
      newElement.height = 1000;
      newElement.stroke = '#e5e7eb';
      
      addElement(newElement);
    }
    
    setActiveTool(TOOLS.SELECT);
    setUrl('');
    setError('');
    closeEmbedModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[450px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <AppWindow className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Embed Workspace</h2>
          </div>
          <button 
            onClick={() => {
              setActiveTool(TOOLS.SELECT);
              closeEmbedModal();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Workspace Shareable Link
            </label>
            <input
              type="text"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="https://docs.google.com/document/d/.../edit"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-2 text-xs text-gray-500">
              Paste the link to your Google Doc, Sheet, or Slide. Make sure the document is accessible.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveTool(TOOLS.SELECT);
                closeEmbedModal();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
            >
              Embed Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
