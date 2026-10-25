# Lessons from QA, and the visual-quality bar

Collected while building and reviewing 100+ labs. Read before you build and again before you finish.

## Predict, then reveal
- While the child predicts, the answer is **fully** hidden: an opaque cover or not drawn at all. No transparency, and no hints in `#val`, `#pill`, the state card, the gauge, the hero lines, the title or the tab labels.
- After the reveal, scroll the stage into view on phones (`showStage()` in `labs/cubes/index.html`, only when the stage is off-screen).
- The reveal always shows the right answer visually (e.g. the correct pair in green), even after a wrong guess.
- Keep the question text visible while the child answers, not only in the setup step.
- State cards must not contain the answer to a puzzle the child is about to solve; use other examples.
- The lab name, registry `title`, `<title>`, blurb and tab labels must not answer any question in the lab or the quiz ("Five lines…" answered "How many lines?").
- A right answer's verdict is `Right!` / `Верно!` / `Így van!`, never "Yes!" (it reads wrong after a right "no").
- Russian text never uses gendered forms like «ты поставил(а)»: rephrase neutrally («Твоя догадка: 28»).
- If an answer is "left/right" but the layout stacks on phones, label the buttons with their content instead.

## Code
- Call the readout function from `render()` too, not only inside `canvasLoop`: a view that hides the canvas never runs the loop, and its readout gets stuck.
- `arc()` / `ellipse()` throw on a negative radius and the frame dies. Easing curves can return about −1e-15 at t = 0: always pass `Math.max(0, r)`.
- `clamp` needs three arguments; `clamp(x)` returns NaN, and `translate(NaN)` is silently ignored. Write your own `clamp01` if you want one.
- `lab.css` stretches every `#stage canvas` over the stage. A small canvas inside the stage (e.g. a preview in a button) needs `#stage .your-class canvas { position: static; inset: auto; }`.
- Never style the class names the shell uses (`.bar`, `.views`, `.chip`, `.card`, `.top`, `.hero`…). Prefix your own (`.ob-bar`).
- One visible "Check" per view: don't leave hidden duplicate buttons with the same label in the DOM.
- Every key in a `T` language object is unique: don't reuse `sec` for a unit and a nested object.
- Colour helpers that parse hex (`shade`, `mix`) must get hex, not an `rgb()` string another helper returned.
- A secret that needs a certain setup sets it up itself when pressed.
- Readouts drop meaningless parts: `2 × 6`, not `0 + 2 × 6`.
- Pointer events (`pointerdown/move/up`) for dragging, with `touch-action: none` only on draggable areas.

## Visual quality
The labs must look crafted, not "made of sticks". The main picture is the most important part of the job.
- Depth: soft gradients instead of flat fills on big shapes, light from the top left, a soft shadow under objects, 1–2 px darker outlines on key shapes.
- A small, harmonious palette per lab (a few hex values), on the dark theme of `lab.css` (its variables `--soft`, `--faint`, `--stroke2`, `--accent`…).
- Believable proportions; animals, people and objects recognisable at 375 px: rounded shapes, eyes with a white highlight, no stick figures.
- Motion with easing, never linear jumps: settling, a little overshoot, a squash on landing.
- Canvas text on a dark rounded pill (≈80 % opaque), clamped inside the canvas, at least 12 px.
- Emoji and objects drawn inside `save()/restore()` with `globalAlpha = 1` and an opaque `fillStyle`, or they look like ghosts.
- Leave space: the main object fills about 60–70 % of the stage and touches no edge.
- Before you finish, ask: would a parent find this picture beautiful on a phone?
