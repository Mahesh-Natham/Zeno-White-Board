Project Architecture & AI Directives

Project: MiroClone (Infinite Canvas Web Application)

Welcome to the MiroClone project. This document serves as a comprehensive guide for developers and AI assistants to understand the project's foundation, architecture, and structural rules.

AI ASSISTANTS: You must read and adhere strictly to these rules before writing or modifying any code in this repository.

1. Overview & Core Philosophy

Building a highly interactive, performance-sensitive canvas app requires strict architectural discipline to prevent performance regressions and spaghetti code.

Single Source of Truth: All canvas data (shapes, text, positions) resides in centralized global stores (Zustand).

Dumb Renderer: The rendering layer (built with Konva) ONLY reads state and draws it. It does NOT calculate business logic or manage state mutations.

Pluggable Tools: User interactions (drawing, selecting, panning) are handled by isolated "Tool" classes/hooks that listen to canvas events and dispatch actions to the store.

2. Tech Stack

Frontend Core: React 19, Vite 8, TypeScript, React Router v7.

State Management: Zustand (modularized: canvasStore, uiStore, authStore, boardStore), immer.

Rendering & Interaction: Konva (react-konva), @dnd-kit, perfect-freehand.

UI & Styling: Tailwind CSS v3, Radix UI Primitives, Framer Motion, Lucide React.

Rich Text: Tiptap, React Hook Form, Zod.

Backend: Firebase 12 (Auth/Syncing), Supabase (Relational schema).

Utilities: date-fns, html2canvas, jspdf.

3. Directory Structure

Maintain strict boundaries between these directories. Do not cross-contaminate logic.

MiroClone/
├── src/  
│ ├── App.tsx # Main routing definition
│ ├── components/ # UI Components, modularized
│ │ ├── auth/ # ProtectedRoute wrapper and auth flows
│ │ ├── canvas/ # The "Dumb Renderer" Konva components
│ │ ├── collaboration/ # Multiplayer cursors, active users UI
│ │ ├── modals/ # Dialogs and popups
│ │ ├── properties/ # Contextual panels to edit selected shapes
│ │ ├── toolbar/ # Canvas interaction tools UI
│ │ ├── dashboard/ # Views for managing boards
│ │ └── shared/ # Reusable generic components
│ ├── hooks/ # Custom React hooks
│ ├── pages/ # Top-level route components
│ ├── store/ # Zustand global state slices
│ │ ├── canvasStore.ts # Single Source of Truth for shapes/camera
│ │ ├── uiStore.ts # UI state (active tool, selected IDs)
│ │ ├── authStore.ts # Current user session
│ │ ├── boardStore.ts # Metadata about the current board
│ │ └── toolStore.ts # Active tool configurations
│ ├── services/ # API calls, Firebase/Supabase wrappers
│ ├── types/ # TypeScript interfaces (Shape, Point)
│ ├── utils/ # Pure functions (math, collisions)
│ └── config/ # App-wide constants

4. Strict Architectural Rules

A. State Management (Zustand + Immer)

Never mutate state directly. Always use the defined store actions.

UI State != Canvas State. The currently active tool goes in uiStore.ts. The coordinates of a drawn shape go in canvasStore.ts.

Atomic Selectors: Always use atomic selectors in React components to prevent unnecessary re-renders (e.g., useCanvasStore(state => state.shapes)).

B. The Rendering Engine (Konva)

No event listeners on shapes: Do not attach onClick or onDrag directly to rendered shapes (e.g., <Rect />, <Circle />) inside src/components/canvas/ to mutate state.

All DOM/Pointer events must be attached to the top-level wrapper (<Stage>) and delegated to the active Tool.

Layering is dictated strictly by the array order of shapes inside the canvasStore. Do not use CSS z-index for canvas elements.

C. The Tool System

Interactions happen at the top-level canvas wrapper, which passes raw pointer coordinates to the currently active tool.

The tool runs the math and dispatches a state change to Zustand.

5. AI Assistant Directives (CRITICAL)

When acting as an AI coding assistant on this project, you MUST obey these operational rules:

Do Not Delete Unrelated Code: When modifying a file, preserve all existing functions, hooks, and event listeners unless explicitly told to remove them.

Think Before You Code: For any feature taking more than 10 lines of code, output a brief step-by-step execution plan detailing which files will be touched before writing the code. Await user approval.

Respect the Boundaries: If asked to "add a feature," update the types, then the store, then the tools logic, and finally the Konva renderer and UI. Do not mix state mutation logic into the UI components.

Assume Complex Re-renders: Be highly mindful of performance. Avoid triggering full React tree re-renders on every mouse move. Use local component state or refs for transient actions (like actively dragging), and commit the final result to the global canvasStore on pointerUp.
