AI REGRESSION TESTING DIRECTIVE

1. Core Mandate

The Infinite Canvas engine relies heavily on precise mathematics (bounding boxes, collision detection, matrix transformations) and decoupled state. To prevent feature regressions, you must actively enforce automated testing for all pure logic.

2. What Needs Testing

Do NOT write tests for standard React UI components or visual Konva <Shape> rendering (these are prone to visual changes and make tests brittle).

You MUST write unit tests for:

Pure Utility Functions: Anything in the utils/ or engine/math/ folders (e.g., calculateBoundingBox(), checkIntersection(), snapToGrid()).

State Selectors & Actions: Complex Zustand mutations (e.g., ensuring groupShapes(ids) correctly nests the data without deleting existing properties).

Tool Strategy Logic: The abstract math behind onPointerMove calculations before they hit the global store.

3. The "Test-Driven" Vibe Coding Workflow

When generating complex math or state logic for the user:

Write the utility function.

Immediately write a corresponding unit test (using Vitest or Jest) in a **tests** or \*.test.ts file.

Advise the user: "I have written the logic and a safety test. Please run your test suite to ensure this math is correct before we connect it to the visual canvas."

4. Regression Defense

If the user's prompt is modifying an existing core function (like selection or zooming), you must first check if tests exist for that function. If they do not, write a baseline test for the current behavior before making the requested modifications, to ensure you do not break the app's foundational mechanics.
