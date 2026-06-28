import React from 'react';
import { createPortal } from 'react-dom';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Maximize2, Minimize2, Bold, Italic, 
  Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Heading1, Heading2, Heading3 
} from 'lucide-react';

import useUiStore from '../../../store/uiStore';

export default function DocElement({ element, isSelected, isEditing, onDoubleClick, onChange }) {
  const { maximizedElementId, toggleMaximize } = useUiStore();
  const isMaximized = maximizedElementId === element.id;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: element.content || '',
    onUpdate: ({ editor }) => {
      onChange({ content: editor.getHTML() });
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();

  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();

  const setAlignLeft = () => editor.chain().focus().setTextAlign('left').run();
  const setAlignCenter = () => editor.chain().focus().setTextAlign('center').run();
  const setAlignRight = () => editor.chain().focus().setTextAlign('right').run();
  const setAlignJustify = () => editor.chain().focus().setTextAlign('justify').run();

  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const ToolbarButton = ({ onClick, isActive, children }) => (
    <button
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`p-1.5 rounded transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
    >
      {children}
    </button>
  );

  const editorNode = (
    <div 
      className={`flex flex-col bg-white border border-gray-200 overflow-hidden ${
        isMaximized ? 'fixed inset-0 w-screen h-screen bg-gray-100 z-[9999]' : 'rounded-lg shadow-lg w-full h-full pointer-events-auto'
      }`}
      onPointerDown={(e) => { e.stopPropagation(); }}
      onWheel={(e) => { e.stopPropagation(); }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200"
      >
        <div className="font-semibold text-gray-700 text-sm flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          Document
        </div>
        <button
          onPointerDown={(e) => { e.stopPropagation(); toggleMaximize(element.id); }}
          className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
        >
          {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-200">
        <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')}><Bold size={14} /></ToolbarButton>
        <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')}><Italic size={14} /></ToolbarButton>
        <ToolbarButton onClick={toggleUnderline} isActive={editor.isActive('underline')}><UnderlineIcon size={14} /></ToolbarButton>
        <ToolbarButton onClick={toggleStrike} isActive={editor.isActive('strike')}><Strikethrough size={14} /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <ToolbarButton onClick={toggleH1} isActive={editor.isActive('heading', { level: 1 })}><Heading1 size={14} /></ToolbarButton>
        <ToolbarButton onClick={toggleH2} isActive={editor.isActive('heading', { level: 2 })}><Heading2 size={14} /></ToolbarButton>
        <ToolbarButton onClick={toggleH3} isActive={editor.isActive('heading', { level: 3 })}><Heading3 size={14} /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <ToolbarButton onClick={setAlignLeft} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft size={14} /></ToolbarButton>
        <ToolbarButton onClick={setAlignCenter} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter size={14} /></ToolbarButton>
        <ToolbarButton onClick={setAlignRight} isActive={editor.isActive({ textAlign: 'right' })}><AlignRight size={14} /></ToolbarButton>
        <ToolbarButton onClick={setAlignJustify} isActive={editor.isActive({ textAlign: 'justify' })}><AlignJustify size={14} /></ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive('bulletList')}><List size={14} /></ToolbarButton>
        <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive('orderedList')}><ListOrdered size={14} /></ToolbarButton>
      </div>

      {/* Editor Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMaximized ? 'p-8 flex justify-center' : 'p-4'}`}>
        <div className={`bg-white ${isMaximized ? 'w-full max-w-[816px] min-h-[1056px] p-12 shadow-md border border-gray-200' : 'w-full h-full'}`}>
          <EditorContent editor={editor} className="w-full h-full prose max-w-none focus:outline-none" />
        </div>
      </div>
    </div>
  );

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable={!isMaximized && isSelected}
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() });
      }}
    >
      {!isMaximized && (
        <>
          <Rect 
            width={element.width} 
            height={element.height} 
            fill="transparent" 
            stroke={isSelected ? '#2563eb' : 'transparent'}
            strokeWidth={2}
            cornerRadius={8}
          />
          <Html 
            groupProps={{ x: 0, y: 0 }} 
            divProps={{ style: { width: element.width, height: element.height } }}
          >
            {editorNode}
          </Html>
        </>
      )}
      {isMaximized && createPortal(editorNode, document.body)}
    </Group>
  );
}
