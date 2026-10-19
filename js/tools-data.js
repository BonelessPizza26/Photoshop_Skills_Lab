/* ============================================================
   TOOL INFORMATION  –  icon = a name from js/icons.js
    –  edit text here to change the Tools page.
   cat   = category used by the filter buttons
   key   = shortcut key
   play  = name of the matching tool in the Playground (optional)
   l2    = extra detail shown in a purple "Go further" box
   ============================================================ */
const TOOLS = [
  /* ---------- MOVE & SELECT ---------- */
  { id: 'move', icon: 'move', name: 'Move Tool', key: 'V', cat: 'select', play: 'move',
    short: 'Moves layers and selections around the canvas.',
    what: 'The Move tool picks up the contents of the selected layer and moves it. It is the tool you will use most.',
    steps: ['Click the layer you want in the Layers panel.', 'Press V for the Move tool.', 'Click and drag on the canvas.', 'Hold Shift while dragging to move in a straight line.'],
    tip: 'Tick “Show Transform Controls” in the Options Bar to see resize handles.',
    l2: 'Auto-Select (Options Bar) selects whichever layer you click on – handy, but it can grab the wrong layer. Use the arrow keys to nudge by 1 px, or Shift+arrow for 10 px.' },

  { id: 'marquee', icon: 'marquee', name: 'Marquee Tools', key: 'M', cat: 'select', play: 'marquee',
    short: 'Draw rectangle or oval selections.',
    what: 'Marquee tools make selections in simple shapes – rectangles and ellipses (ovals). A selection shows as “marching ants” and limits where your edits happen.',
    steps: ['Press M (Shift+M swaps between rectangle and ellipse).', 'Drag on the canvas to draw the selection.', 'Hold Shift to make a perfect square or circle.', 'Press Ctrl+D to deselect.'],
    tip: 'Hold Alt to draw from the centre outwards.',
    l2: 'Add Feather (Select › Modify › Feather) to soften the selection edge. Hold Shift to add to a selection, Alt to subtract from it.' },

  { id: 'lasso', icon: 'lasso', name: 'Lasso Tools', key: 'L', cat: 'select', play: 'lasso',
    short: 'Draw freehand or straight-edged selections.',
    what: 'There are three lassos: the <strong>Lasso</strong> (draw freehand like a pencil), the <strong>Polygonal Lasso</strong> (click points to make straight edges – great for buildings and boxes) and the <strong>Magnetic Lasso</strong> (snaps to edges as you move along them).',
    steps: ['Press L, or right-click the lasso icon to choose a type.', 'Lasso: hold the mouse and draw round the object.', 'Polygonal: click corner to corner, then click the start point to close.', 'Magnetic: click once, then slowly trace the edge.'],
    tip: 'Pressed the wrong point with the Polygonal Lasso? Press Backspace to remove the last point.',
    l2: 'Combine lassos with selection modes – Shift adds, Alt subtracts. Use Select and Mask afterwards to refine tricky edges like hair.' },

  { id: 'quick', icon: 'wand', name: 'Quick Selection & Magic Wand', key: 'W', cat: 'select', play: 'wand',
    short: 'Select areas automatically by colour and edges.',
    what: 'The <strong>Quick Selection</strong> tool is painted over an area and it finds the edges for you. The <strong>Magic Wand</strong> selects every pixel of a similar colour with one click – great for plain backgrounds.',
    steps: ['Press W.', 'Quick Selection: brush over the object you want.', 'Magic Wand: click once on a colour.', 'Change Tolerance (Options Bar) – low = only very similar colours, high = more colours.'],
    tip: 'Try Select › Subject – Photoshop uses AI to select the main person or object for you.',
    l2: 'Tick “Contiguous” for only touching pixels; untick it to select that colour everywhere in the image. The Object Selection tool lets you draw a box around an object and it auto-selects it.' },

  { id: 'crop', icon: 'crop', name: 'Crop Tool', key: 'C', cat: 'select', play: 'crop',
    short: 'Cut off the edges of an image.',
    what: 'Crop trims your image to improve the composition or change the shape (e.g. square for Instagram).',
    steps: ['Press C.', 'Drag the handles at the edges/corners.', 'Choose a ratio in the Options Bar (1:1, 16:9…).', 'Press Enter to confirm.'],
    tip: 'Use the rule-of-thirds grid – put your subject on a line or where two lines cross.',
    l2: 'Untick “Delete Cropped Pixels” to crop non-destructively. The Straighten button lets you draw along a horizon to level a wonky photo.' },

  /* ---------- PAINT ---------- */
  { id: 'brush', icon: 'brush', name: 'Brush Tool', key: 'B', cat: 'paint', play: 'brush',
    short: 'Paint with the foreground colour.',
    what: 'The Brush paints soft or hard strokes using your foreground colour. Change the <strong>Size</strong>, <strong>Hardness</strong> (soft or sharp edge), <strong>Opacity</strong> and <strong>Flow</strong>.',
    steps: ['Press B.', 'Pick a colour (click the top colour square).', 'Right-click the canvas to change size and hardness.', 'Paint! Hold Shift and click two points for a straight line.'],
    tip: '[ makes the brush smaller, ] makes it bigger.',
    l2: 'Opacity = maximum strength of a stroke. Flow = how quickly paint builds up while you keep painting over the same spot. Explore the Brush Settings panel (F5) for scattering, texture and pen-pressure options.' },

  { id: 'pencil', icon: 'pencil', name: 'Pencil Tool', key: 'B', cat: 'paint', play: 'pencil',
    short: 'Hard-edged drawing – great for pixel art.',
    what: 'Like the brush but always 100% hard edges with no anti-aliasing (no smoothing). Perfect for pixel art.',
    steps: ['Right-click the Brush icon and choose Pencil.', 'Set size to 1 px for pixel art.', 'Zoom right in and draw.'],
    tip: 'Turn on View › Show › Pixel Grid when zoomed in.' },

  { id: 'eraser', icon: 'eraser', name: 'Eraser Tool', key: 'E', cat: 'paint', play: 'eraser',
    short: 'Removes pixels from a layer.',
    what: 'The Eraser deletes pixels. On a normal layer it leaves transparency (the grey and white checkerboard). On a locked Background layer it paints the background colour instead.',
    steps: ['Press E.', 'Select the layer you want to erase from.', 'Set size, hardness and opacity like a brush.', 'Drag over the area to remove.'],
    tip: 'Low opacity eraser = gentle fading.',
    l2: 'Erasing is destructive – the pixels are gone for good. Professionals use a Layer Mask instead (see the Layers page). Background Eraser and Magic Eraser remove colours automatically.' },

  { id: 'bucket', icon: 'bucket', name: 'Paint Bucket & Gradient', key: 'G', cat: 'paint', play: 'bucket',
    short: 'Fill areas with colour or smooth blends.',
    what: 'The <strong>Paint Bucket</strong> fills an area of similar colour with your foreground colour. The <strong>Gradient</strong> tool blends smoothly from one colour to another.',
    steps: ['Press G (Shift+G to swap).', 'Bucket: click inside an area.', 'Gradient: drag across the canvas – the length of the line controls how smooth the blend is.'],
    tip: 'Hold Shift while dragging a gradient to keep it perfectly straight.',
    l2: 'Try radial, angle and reflected gradients. A Gradient Fill layer (Layer › New Fill Layer) can be re-edited at any time.' },

  { id: 'eyedropper', icon: 'eyedropper', name: 'Eyedropper', key: 'I', cat: 'paint', play: 'eyedropper',
    short: 'Pick up a colour from your image.',
    what: 'Click any part of the image to make that colour your foreground colour. Great for matching colours.',
    steps: ['Press I.', 'Click a colour in the image.', 'Your foreground colour changes to it.'],
    tip: 'While using the Brush, hold Alt to switch to the Eyedropper for a second.' },

  /* ---------- RETOUCH ---------- */
  { id: 'clone', icon: 'clone', name: 'Clone Stamp', key: 'S', cat: 'retouch', play: 'clone',
    short: 'Copies pixels from one area to another.',
    what: 'The Clone Stamp copies (clones) one part of an image and paints it somewhere else. Use it to remove unwanted objects, or duplicate things.',
    steps: ['Press S.', 'Hold Alt and click the area you want to copy FROM (the source).', 'Let go of Alt.', 'Paint over the area you want to cover – a + shows where it is copying from.'],
    tip: 'Re-pick your source often (Alt+click) so the repeat isn’t obvious.',
    l2: 'Tick “Aligned” so the source moves with you. Set Sample to “Current & Below” and clone onto an empty new layer – non-destructive retouching!' },

  { id: 'healing', icon: 'heal', name: 'Spot Healing & Healing Brush', key: 'J', cat: 'retouch', play: 'heal',
    short: 'Remove spots, dust and blemishes.',
    what: 'The <strong>Spot Healing Brush</strong> removes small marks automatically – just paint over them. The <strong>Healing Brush</strong> works like the Clone Stamp but blends the texture and lighting so it matches. The <strong>Patch</strong> tool lets you drag a selection over a clean area to fix it.',
    steps: ['Press J.', 'Make the brush slightly bigger than the spot.', 'Click or paint over the blemish.'],
    tip: 'Content-Aware Fill (Edit › Content-Aware Fill) removes bigger objects.',
    l2: 'Choose Content-Aware type in the Options Bar for best results. Generative Fill (if available) uses AI to replace selected areas – use it carefully and say when you have used AI in your work.' },

  { id: 'blur', icon: 'blur', name: 'Blur, Sharpen & Smudge', key: '', cat: 'retouch', play: 'blur',
    short: 'Soften, sharpen or push pixels.',
    what: '<strong>Blur</strong> softens areas you paint over. <strong>Sharpen</strong> adds crispness. <strong>Smudge</strong> drags pixels like a finger through wet paint.',
    steps: ['Find them under the water-drop icon in the toolbar.', 'Set Strength in the Options Bar.', 'Paint over the area.'],
    tip: 'Don’t overdo Sharpen – it creates grainy “noise”.' },

  { id: 'dodge', icon: 'dodge', name: 'Dodge, Burn & Sponge', key: 'O', cat: 'retouch', play: 'dodge',
    short: 'Lighten, darken or change colour strength.',
    what: '<strong>Dodge</strong> lightens areas. <strong>Burn</strong> darkens areas. <strong>Sponge</strong> adds or removes colour saturation. These names come from old darkroom photography.',
    steps: ['Press O.', 'Set Range (Shadows, Midtones, Highlights) and Exposure.', 'Paint over the area – build it up slowly.'],
    tip: 'Keep Exposure low (10–20%).',
    l2: 'Non-destructive method: new layer › Edit › Fill › 50% Grey › set blend mode to Overlay, then dodge and burn on that layer.' },

  /* ---------- CREATE ---------- */
  { id: 'type', icon: 'text', name: 'Type Tool', key: 'T', cat: 'create', play: 'text',
    short: 'Add text to your design.',
    what: 'Adds a text layer. Change the font, size and colour in the Options Bar or the Character panel.',
    steps: ['Press T.', 'Click once for a short line, or drag a box for a paragraph.', 'Type your text.', 'Click the ✓ tick or press Ctrl+Enter to finish.'],
    tip: 'Double-click the “T” thumbnail in the Layers panel to select all the text.',
    l2: 'Use the Character panel for tracking (spacing between all letters), kerning (between two letters) and leading (between lines). Right-click a text layer › Convert to Shape to edit letterforms.' },

  { id: 'shape', icon: 'shape', name: 'Shape Tools', key: 'U', cat: 'create', play: 'shape',
    short: 'Draw rectangles, ellipses, polygons and lines.',
    what: 'Shape tools create <strong>vector</strong> shapes that stay sharp when resized. Set Fill and Stroke colours in the Options Bar.',
    steps: ['Press U.', 'Choose Fill and Stroke colour.', 'Drag on the canvas. Hold Shift for perfect squares/circles.'],
    tip: 'You can round the corners of a rectangle in the Properties panel.' },

  { id: 'pen', icon: 'pen', name: 'Pen Tool', key: 'P', cat: 'create',
    short: 'Draw precise paths and curves.',
    what: 'The Pen tool draws paths using anchor points. Click for straight lines, click-and-drag for curves. Paths can become selections or shapes.',
    steps: ['Press P.', 'Click to place points; drag to make curves.', 'Click your first point to close the path.', 'Right-click › Make Selection.'],
    tip: 'Hold Ctrl to move a point; hold Alt to change a curve’s direction.',
    l2: 'The most accurate way to cut out hard-edged objects (cars, products). Save paths in the Paths panel to reuse them.' },

  { id: 'zoom', icon: 'zoom', name: 'Zoom & Hand', key: 'Z / H', cat: 'create', play: 'zoom',
    short: 'Get close and move around.',
    what: 'Zoom (Z) gets closer to your image. Hand (H) moves you around when zoomed in. They don’t change your image at all.',
    steps: ['Press Z and click to zoom in. Alt+click zooms out.', 'Hold Space at any time to use the Hand.'],
    tip: 'Ctrl+0 fits the whole image on screen.' }
];

/* Settings that appear on many tools */
const SETTINGS = [
  { icon: 'size', name: 'Size', text: 'How big the brush is in pixels. Shortcut: [ and ].' },
  { icon: 'hardness', name: 'Hardness', text: '100% = sharp, crisp edge. 0% = soft, fuzzy edge.' },
  { icon: 'opacity', name: 'Opacity', text: 'How see-through it is. 100% = solid, 0% = invisible. Press number keys: 5 = 50%, 0 = 100%.' },
  { icon: 'flow', name: 'Flow', text: 'How fast paint builds up when you paint over the same place again and again.' }
];
