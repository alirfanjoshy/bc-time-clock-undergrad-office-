# Campus loading animation

The loader appears while the initial web bundle loads and after an API request takes more than 350 ms. It clears when all pending JSON/PDF requests finish, including failed requests. Fast requests do not introduce an artificial delay. The overlay does not trap focus or block interaction. Reduced-motion preferences disable animation.

Preview: `/#loading-preview` (no account required).

Artwork was created with the built-in image-generation tool, using the user-supplied building and bulldog illustration as the reference. The final project assets are:

- `frontend/desktop/public/loading/campus.png`: transparent college background.
- `frontend/desktop/public/loading/bulldog-run.png`: four-frame transparent running sprite strip.
- `frontend/desktop/public/loading/loader.css`: running cycle, bounce, shadow, motion lines, and responsive layout.

Prompts:

1. Recreate only the reference's Brooklyn College red-brick building, clock tower, gold cupola, olive trees and cream clouds. Remove the dog, speed marks and ground shadow, reconstruct the obscured building, preserve the soft illustration style, use a transparent background, and omit text.
2. Create a horizontal sprite sheet containing exactly four consecutive running poses of the reference's maroon-outlined gold-and-white bulldog, facing right. Keep the character scale and center consistent in equal-width cells; use extended, gathered, tucked, and opposite-extended leg poses. Preserve its face and collar; omit scenery, text, grid lines, shadows, and speed marks; use transparency.

Validation: production build; browser preview; request-count checks for overlapping successes and failures. The CSS treats the 2172 × 724 dog sheet as four 543 × 724 cells.
