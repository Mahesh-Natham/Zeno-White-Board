# Current State

## Backend Synchronization Optimization (Completed)

- **SyncEngine (`src/services/syncEngine.ts`)**: Created a dedicated service to debounce and batch Firebase network requests. Employs a lodash-style throttle with `{ wait: 300, maxWait: 2000 }`. Handles `ADD`, `UPDATE`, and `DELETE` actions securely, and binds to the `beforeunload` window event to guarantee no data loss on tab close.
- **Rubber-Banding Prevention**: `SyncEngine` maintains a Set of locked elements currently being modified locally. `InfiniteCanvas.tsx` filters incoming `onValue` remote payloads from Firebase, dropping updates for locked elements to prevent visual rubber-banding or jumping during drag/edit.
- **Store Integration (`src/store/canvasStore.ts`)**: Redirected all network write calls within `performAction` to `syncEngine.queueAdd`, `queueUpdate`, and `queueDelete`.
- **UI State Indicator (`src/components/toolbar/TopBar.tsx`)**: Added a visual sync status indicator ('Saving...', 'Saved', 'Idle' Cloud icon) that hooks into `uiStore.ts` to provide user feedback on network operations.

Next steps for Verification: Manual verification of network batching via DevTools and multiplayer simulation.

## Word Document Feature (Completed)

- **Tiptap Editor Core**: Implemented `DocElement.tsx` using `@tiptap/react` to provide a robust rich-text editing experience inside the canvas. Included extensions for underline and text alignment.
- **Dynamic Render Modes**: The document defaults to a 600x800 floating canvas element. It includes a Maximize button in the header that utilizes a React Portal (`createPortal`) to break the editor out of the Konva overlay, filling the screen with a "Print Layout" view.
- **Auto-Syncing**: Wired up Tiptap's `onUpdate` hook to emit `onChange` events, allowing real-time multi-player syncing of the document's HTML content.
- **Store & Tool State**: Added `maximizedElementId` to `uiStore.ts`, exported `TOOLS.DOC`, and hooked the tool into the `MoreToolsFlyout.tsx` and `CreationFlyout.tsx`.
- **Canvas Instantiation**: Updated `useCanvasDrawing.ts` to instantiate a new `doc` element on a single click when the tool is active.

## MiroClone Canvas & UI Enhancements (Completed)

- **Elbow Arrow orthogonal routing**: Changed bezier curves to orthogonal paths with strict 90-degree corners in `ElbowArrowElement.tsx`.
- **Rotatable Block Arrows**: Enabled block arrow rotation via an offset group configuration, and enabled length resizing using the standard `handleDotDragStart` loop in `useCanvasDrawing.ts`.
- **Rounded Sticky Notes**: Adjusted the `cornerRadius` on `StickyNoteElement.tsx` to 10px.
- **Outside-Click Toolbar Close**: Hooked up `pointerdown` listeners on `LeftToolbar.tsx` to automatically retract flyouts on outside clicks.
- **Keyboard Shortcuts**: Added `R` (Rectangle) and `O` (Circle) tool mappings to `useKeyboardShortcuts.ts`.
- **Cursor State Persistence**: Synchronized the crosshair cursor via `InfiniteCanvas.tsx` and the Timeline DOM overlays to ensure it stays active during drawing interactions while respecting `activeTool === TOOLS.SELECT` states.
- **Smooth Marker**: Updated `freehandUtils.ts` to use `smoothing: 0.75` and `streamline: 0.6`, rendering with `<Path>` in `MarkerElement.tsx`.
- **Darker Frame Borders**: Changed the `<Rect>` stroke from `#d1d5db` to `#9ca3af` inside `FrameElement.tsx`.
- **Reaction Tool Toolset**: Created `ReactionFlyout.tsx` and mapped emoji selection into `LeftToolbar.tsx` under the new `TOOLS.REACTION` identifier. Handled automatic 60x60 transparent text generation in `useCanvasDrawing.ts`.
- **Toolbar Cleanup**: Removed obsolete Creation items (`prototype`, `doc`, `slides`, `engage`, `flows`) and More Tools items (`prototype`, `engage`, `diagram`) from the flyout definitions to streamline the UI.

## Canvas Interaction Refactor (Completed)

- **Transient UI State (`src/store/uiStore.ts`)**: Introduced `uiStore` with `dragOffsets` to manage lightweight, 60fps local drag/select coordinates without mutating the main synchronization `canvasStore`.
- **Top-Level Pointer Hooks (`src/hooks/useElementDragging.ts` & `src/hooks/useCanvasDrawing.ts`)**: Centralized selection and drag movement handling. The application now figures out which shape is interacted with based on intersecting mouse coordinates on the root `<Stage>`, drastically reducing React re-renders.
- **"Dumb" Renderers**: Stripped individual `onClick`, `onDragStart`, `draggable={true}`, and localized event logic from all canvas components (e.g. `RectangleElement`, `CircleElement`, `TimelineSidebar`, `KanbanCard`). Components are now strictly 100% visual. `ElementRenderer.tsx` intercepts transient `dragOffsets` to dynamically offset children visually during drags.
- **Syntax Repairs**: Fixed all build-time JSX syntax errors originating from the extensive automated properties stripping. Production build runs clean.

Next steps for Verification: Manually test the canvas selection box, multi-selection, and drag fluidity to ensure smooth 60fps visually-correct interaction.

## Connector Snapping & Stability (Completed)

- **Target Detection (`src/hooks/useCanvasDrawing.ts`)**: Resolved an issue where connectors (lines, arrows) would fail to snap to target shapes because the drawing preview line was intercepting the pointer event. Implemented `getAllIntersections` to correctly scan "through" the preview line and target the actual `board-element` beneath it.
- **Firebase Sync Drops**: Fixed a critical bug where finalized connectors with `dash = undefined` would cause the Firebase Realtime Database SDK to throw a synchronous error, preventing the sync. Replaced it with `delete finalElement.dash` to guarantee successful network saves.
- **Dimension Fallbacks**: Injected robust fallback dimensions (1000x700 for Kanban/Table, 900x600 for Timeline) into the interaction hooks (`useCanvasDrawing.ts`) and calculation utilities (`canvasUtils.ts`). This guarantees successful connector routing and snapping even if an element lacks explicit width or height metadata in the Zustand store.
- **HTML Overlay Pointer Interpolation**: Fixed a critical bug where DOM-based HTML overlays (`pointer-events: auto`) were intercepting and dropping `mousemove`/`mouseup` events before they reached the Konva Canvas, effectively freezing the connector drawing loop in mid-air. Implemented `setPointerCapture` via standard DOM APIs in `handleDotDragStart` and `handleMouseDown` to force the canvas to retain exclusive pointer focus until `mouseup`.
- **Target Tagging**: Added `name="board-element"` directly to the base Konva `<Rect>` of Timeline, Kanban, and Table elements, bypassing all edge-case fallback checks in `getAllIntersections` and allowing the hit graph to snap connections natively.
- **Kanban Drag-and-Drop Restoration**: Re-enabled drag-and-drop state persistence inside the Kanban Board by binding the `onDragStart` and `onDragEnd` event handlers to the core `@dnd-kit/core` `<DndContext>`.
- **Kanban Drag Event Bubbling Fix**: Prevented the Kanban board from moving around the canvas when a user attempts to drag a Kanban card or column. Expanded the `isInteractive` guard in `KanbanElement.tsx` to explicitly intercept pointer events targeting `.kanban-card` and `.kanban-column-header`, safely stopping them from bubbling up to the Konva layer while preserving the native `@dnd-kit` drag mechanics. Added `cursor-grab` signature to the Kanban cards.
- **Kanban Header Refactoring**: Extracted the board title from the inline toolbar inside `KanbanHeader.tsx`. Elevated it to a standalone header above the toolbar using a vertical flex layout and adjusted the `y` offset to mathematically offset the newly increased header height, avoiding intersection with the main board canvas. Proxy `onWheel` scroll zooming is fully supported across both the title and the toolbar tools.
- **Overlay Connection Target Points**: Connection dots now render safely around the explicit exterior boundaries of Kanban, Table, and Timeline HTML overlays by implementing fallback perimeter calculations.
- **Styling**: Connectors now default to a light orange color (`#fdba74`) when dragged from connection dots or drawn via smart connector.
- **Google Workspace Integration**: Added the ability to embed interactive Google Docs, Sheets, and Slides via the More Tools flyout. The system prompts for a shareable URL, automatically sanitizes `/edit` into `/preview` for iframe safety, and drops an interactable, draggable iframe directly onto the Konva canvas layer.
- **Verification**: Built cleanly; spatial intersection handles connector docking dynamically, and lines no longer disappear on canvas updates.

Next steps for Verification: Test dragging a line from a connection dot onto a shape and confirm the line logically binds to that shape (and moves with it).

## HTML Overlay Connector Drops (Completed)

- **Fallback Hit-Testing Guard (`src/hooks/useCanvasDrawing.ts`)**: Added a guard clause in the `handleMouseUp` fallback loop to exclude `previewElement.startElementId`. This prevents connectors from mistakenly snapping back to their origin element (like Timeline) when dropped on overlapping HTML overlays.
- **Dynamic Pointer Events**: Modified HTML overlays (`KanbanElement`, `TableElement`, `GoogleWorkspaceElement`) to dynamically set `pointerEvents: 'none'` when the user is actively holding a connection tool. This allows pointer events to correctly pass through the DOM layers and hit the underlying Konva canvas for successful connector snapping.

Next steps for Verification: Draw a connection starting from a native Konva element (like a Timeline) and drop it onto an HTML overlay (Kanban or Table) and confirm that the connector successfully connects to the overlay without being intercepted by its DOM elements or snapping back to itself.

## Image Upload Implementation (Firebase Spark Plan Aligned) (Completed)

- **Storage Layer**: Initialized `getStorage` in `src/config/firebase.ts` and created `src/services/storageService.ts` to upload files directly to Firebase Storage with proper UUID naming.
- **Client-Side Compression (`src/utils/imageCompressor.ts`)**: Implemented browser-side image resizing and compression (max 1920x1080, 80% JPEG quality) to respect Firebase Spark Plan's strict 5GB storage and 1GB bandwidth limits. PNG transparency is preserved.
- **Canvas Integration (`src/hooks/useCanvasDrawing.ts`)**: Modified the `TOOLS.IMAGE` handling to trigger a native file picker on canvas click. Places a temporary "Uploading..." placeholder element on the canvas while compression and Firebase upload occur, preventing UI locks.
- **Konva Rendering (`src/components/canvas/elements/ImageElement.tsx`)**: Created `ImageElement` using `react-konva` and `use-image` to asynchronously load and render the final Firebase Storage image URL. Includes visual uploading states.
- **Dependencies**: Installed `use-image` via npm.

Next steps for Verification: Select the Image tool, click the canvas, pick a large image file, and ensure it renders a placeholder before snapping to the final uploaded image. Check Firebase Storage console to confirm size reduction.
