# Outline scenes v2 — generation record

Mode: built-in image_gen. Three bounded calls run concurrently, two edits and one new generation. transparent_background: true for every call. No variants, retries, or image postprocessing.

Validation: inspected all three PNGs visually. All are 1254 × 1254 RGBA with real transparency and visually empty enclosed interiors. Original scene composition is retained in both edits. The new scene contains full bodies, shared lifted leaf, mushroom, curved tree and sparse flowers. No blue-dominant pixels were detected at alpha >= 128 (RGB blue exceeding both red and green by more than 5). Generated strokes are not mathematically uniform #626262: minor hue variation remains, mainly at antialiased edges. Strongly visible chromatic pixels (alpha >= 128, channel spread > 5) are 24 in space, 274 in Jiskra forest, 96 in children forest. No cleanup or retries were performed.

## space-blik-outline-v2.png

Intent: edit

Reference / edit target: C:/Users/573/Desktop/etern/omalovanky/generated-margin-scenes-v1/space-blik-v1.png

Exact prompt:

```text
Use case: precise-object-edit
Asset type: transparent PNG coloring-book margin vignette.
Input image 1 is the exact EDIT TARGET. Preserve its exact scene composition, boy identity, facial expression, hair, full-body astronaut pose, helmet, Blik robot, flag and pole, ringed planet, stars and curved lunar ground.
Primary request: remove ALL existing color, pale blue, white fills and any gray fills or shading. Render ONLY clean neutral gray #626262 contour lines. Every enclosed region must have actual alpha transparency, including face, skin, hair, spacesuit, gloves, boots, helmet glass, robot head and body, planet, flag and ground. Remove any filled pupils and mouths by making these simple outline contours with transparent interiors.
Style: retain the exact rounded friendly coloring-book line drawing and existing shape geometry.
Constraints: only neutral gray outline strokes on actual transparent alpha; no blue or other hue, no white background or fill, no gray fill, no shading, no gradient, no glow, no solid silhouettes. Keep all enclosed interiors empty and transparent. No text, logo or frame.
```

## magic-forest-jiskra-outline-v2.png

Intent: edit

Reference / edit target: C:/Users/573/Desktop/etern/omalovanky/generated-margin-scenes-v1/magic-forest-jiskra-v1.png

Exact prompt:

```text
Use case: precise-object-edit
Asset type: transparent PNG coloring-book margin vignette.
Input image 1 is the exact EDIT TARGET. Preserve its exact scene composition, girl identity, facial expression, hair and flower hairclip, full-body dress and boot pose, Jiskra unicorn identity, mane, horn, tail, star necklace, curved tree, leaves, large flower and ground.
Primary request: remove ALL existing color, pale blue, white fills and any gray fills or shading. Render ONLY clean neutral gray #626262 contour lines. Every enclosed region must have actual alpha transparency, including faces, skin, hair, dress, boots, unicorn body, mane, horn, tail, star pendant, flowers, tree and leaves. Remove any filled pupils and mouths by making these simple outline contours with transparent interiors.
Style: retain the exact rounded friendly coloring-book line drawing and existing shape geometry.
Constraints: only neutral gray outline strokes on actual transparent alpha; no blue or other hue, no white background or fill, no gray fill, no shading, no gradient, no glow, no solid silhouettes. Keep all enclosed interiors empty and transparent. No text, logo or frame.
```

## forest-children-discovery-outline-v2.png

Intent: generate

Reference / edit target: None. New generation; no referenced_image_paths and no num_last_images_to_include.

Exact prompt:

```text
Use case: illustration-story
Asset type: transparent PNG coloring-book margin vignette.
Scene: a cheerful boy aged five in simple overalls and a cheerful girl aged five in a simple dress and boots together in a magic forest, gently lifting one large leaf together to discover a small mushroom. Include one curved tree and only a few broad leaves and simple flowers.
Style: friendly rounded children's coloring-book drawing, clean moderately bold neutral gray #626262 outline strokes only, simple readable shapes.
Composition: sparse square vignette, full bodies and feet fully visible, comfortably contained with empty space around them. Both children smile warmly and look toward the mushroom.
Transparency: genuine transparent background AND transparent interiors of absolutely every enclosed shape, including faces, skin, hair, clothes, bodies, boots, leaves, mushroom and tree. Eyes and mouths must be hollow outline contours, without solid fills.
Constraints: only #626262 linework; no color, no blue, no white fill, no gray fill, no shading, no gradient, no glow, no solid areas. No companion animal or robot. No text, logo, watermark or frame.
```


Integrated exports: dist/assets/scenes/boy-blik-space-v2.webp, girl-jiskra-forest-v2.webp, children-magic-forest.webp. 640 × 640 WebP, quality 88, alpha preserved. All outputs visually inspected; enclosed areas are transparent. CSS grayscale(1) guarantees neutral rendered outlines despite minor source edge hue variation.
