# Margin scenes: warm background ink and corrected eyes

All three decorative margin scenes now use their alpha channel as a CSS mask, with the doodle background's #806a50 ink and 0.24 opacity. Existing layout is preserved. This removes source hue variation and keeps the interiors transparent.

Boy asset: dist/assets/scenes/boy-blik-space-v3.png. Built-in image_gen edit, transparent_background true. Inspected result: both pupils filled consistently; scene retained.

Exact prompt:

Use case: precise-object-edit. Edit target is the provided transparent line-art image of the astronaut boy with robot. Correct ONLY the boy's two eyes: give both eyes clean solid filled pupils of the SAME gray as existing contour strokes, with tiny transparent highlights and a consistent friendly gaze. Currently the hollow eye rings look incorrect. Preserve every other part as exactly as possible: boy face identity, smile, hair, helmet, suit, pose, robot, flag, planet, stars, ground, line thickness, layout and gray contour color. No other filled regions. Preserve genuine transparent background and transparent shape interiors. Output a square transparent PNG. No text, no added objects.
