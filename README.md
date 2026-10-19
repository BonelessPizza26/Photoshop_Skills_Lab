# Photoshop Skills Lab – setup guide for VS Code

An interactive website that teaches Adobe Photoshop to UAL students.
No installs or frameworks – it is plain HTML, CSS and JavaScript, and everything (icons, PDF certificates) is built in.

---

## 1. What's in the folder

```
photoshop-skills-lab/
├── index.html        Home page – learning path, progress bar, flip cards
├── workspace.html    Clickable Photoshop screen, new document, Export As guide, JPEG vs PNG
├── tools.html        18 tool cards with pop-ups + live brush settings demo
├── editing.html      Rotate/transform, crop, colour adjustments, manipulation guides
├── layers.html       Working Layers panel simulator + paintable layer mask
├── filters.html      Filter gallery with before/after slider
├── playground.html   Mini-Photoshop: 18 working tools, menus, adjustments, challenges
├── quiz.html         Award quiz with PDF certificate + shortcut-key speed game
├── css/
│   └── style.css     All the styling (colours, hover effects, animations)
├── js/
│   ├── icons.js      The icon set (Material Design Icons) – works offline
│   ├── main.js       Shared code: menu bar, pop-ups, toasts, progress
│   ├── certificate.js Draws the award certificate and saves it as a PDF
│   ├── logo.js       Oldham College logo used on the certificate
│   ├── tools-data.js The text for every tool card (easy to edit)
│   └── playground.js The mini-Photoshop engine
└── images/
    └── sample.svg    The practice image
```

---

## 2. Open it in VS Code (step by step)

1. **Install VS Code** (if it isn't already): <https://code.visualstudio.com>
2. **Unzip** `photoshop-skills-lab.zip` somewhere easy to find, e.g. your Desktop or OneDrive.
   *Right-click › Extract All* on Windows – don't open the files from inside the zip.
3. In VS Code go to **File › Open Folder…** and choose the `photoshop-skills-lab` folder.
   (If asked "Do you trust the authors?" click **Yes, I trust the authors**.)
4. You'll see all the files in the **Explorer** panel on the left.

## 3. Install Live Server (recommended)

Live Server opens the site in your browser and refreshes it every time you save.

1. Click the **Extensions** icon on the left bar (four squares) or press `Ctrl+Shift+X`.
2. Search for **Live Server** (by Ritwick Dey) and click **Install**.
3. Open `index.html`, then **right-click inside the code › Open with Live Server**
   (or click **Go Live** in the blue bar at the bottom right).
4. Your browser opens at something like `http://127.0.0.1:5500/index.html`. 🎉

> **Without Live Server?** You can double-click `index.html` to open it straight in a browser.
> Everything works except the **Pixelate** thumbnail on the Filters page, because browsers block some
> image features on files opened that way. Use Chrome or Edge for the best results.

---

## 4. Customising it

Save the file (`Ctrl+S`) and Live Server refreshes the page automatically.

| I want to… | Open this file | What to change |
|---|---|---|
| Change the site colours | `css/style.css` | The values at the top inside `:root { }` – e.g. `--accent: #31a8ff;` |
| Edit a tool's explanation | `js/tools-data.js` | The `what`, `steps`, `tip` and `l2` text for that tool |
| Add a quiz question | `quiz.html` | Copy a line in the `QUESTIONS` list. `c` is the correct answer's position (0 = first). Add `icon: 'lasso'` to make it a “Which tool is this?” question |
| Change the number of quiz questions | `quiz.html` | `const TOTAL = 20, ICON_QS = 5;` |
| Change the pass mark or award levels | `js/certificate.js` | `PASS_MARK = 60` and the `awardTier` function (Distinction 85%, Merit 70%, Pass 60%) |
| Change the tutor signature | `js/certificate.js` | `const TUTOR_NAME = 'Jamil Ahmed';` |
| Change the college logo | `js/logo.js` + `images/` | See the note at the top of `js/logo.js` |
| Change an icon | any page | Icons are written as `<i data-i="brush"></i>` – swap the name for another one listed in `js/icons.js` |
| Change the Playground challenges | `js/playground.js` | The `CHALLENGES` list near the bottom |
| Change the menu links | `js/main.js` | The `PAGES` list at the top |
| Use your own practice photo | `images/` | Add e.g. `photo.jpg`, then in VS Code use **Edit › Replace in Files** (`Ctrl+Shift+H`) to replace `images/sample.svg` with `images/photo.jpg`. Landscape photos at roughly 8:5 ratio work best |

**Go further boxes:** anything wrapped in `<div class="l2"> … </div>` appears as a purple “Go further” box for extra detail.

**Pop-ups:** any page can open one with
`openModal({ icon: 'palette', title: 'My title', html: '<p>Any HTML here</p>' })`.

**Hover tooltips:** add `data-tip="Your tip"` to any element.

---

## 5. Sharing it with students

- **Simplest:** put the unzipped folder on the shared drive / Teams / OneDrive and tell students to open `index.html`.
- **As a web link (free):**
  - **Netlify Drop** – go to <https://app.netlify.com/drop> and drag the whole folder onto the page. You get a link instantly.
  - **GitHub Pages** – upload the folder to a GitHub repository, then *Settings › Pages › Deploy from branch*.

Student progress ("Mark as learnt", challenges, best sprint score) is saved in **their own browser** on that computer – nothing is collected or sent anywhere.

---

## 6. Page features at a glance

- **Everywhere:** sticky menu, scroll progress bar, scroll-reveal animations, glowing hover cards, back-to-top button, "Mark as learnt" progress.
- **Workspace:** click areas of a mock Photoshop screen for pop-ups; document-settings helper; step-by-step **Export As** guide with a working Export As window (live JPEG quality, file size, transparency, real download); JPEG vs PNG comparison and a “Which format?” game; live-search shortcut table.
- **Tools:** filter by category, search, pop-up for every tool with steps and tips, "Try it in the Playground" buttons, and a real brush that shows Size / Hardness / Opacity / Flow.
- **Image Editing:** rotate/scale/skew/flip demo, draggable crop with rule-of-thirds and ratios, 7 adjustment sliders with before/after slider and presets, step-by-step manipulation guides.
- **Layers:** a working Layers panel (visibility, order, opacity, blend modes, drag layers) and a paint-on layer mask showing "black conceals, white reveals".
- **Filters:** 11 live filters with strength sliders and a before/after comparison.
- **Playground:** Move, Marquee, Lasso (freehand + polygonal), Magic Wand, Crop, Eyedropper, Brush, Pencil, Eraser, Paint Bucket, Gradient, Clone Stamp, Spot Healing, Blur, Dodge/Burn/Sponge, Type, Shapes, Zoom – plus menus (rotate, flip, select inverse, 8 filters), adjustments, undo/redo, real Photoshop shortcuts, open your own photo and download as PNG.
- **Quiz:** students enter their name and student ID, answer 20 random questions from a pool of 57 (including “Which tool is this?” icon questions) with streaks and keyboard answers, and see which questions to revise. Below 60% the certificate stays locked and they retake with new questions. At 60%+ an animated certificate appears (seal stamp, tilt and shine, flip for an award summary) and they can download the **Photoshop Skills Lab Award** PDF with the Oldham College logo and tutor signature (Pass 60%+, Merit 70%+, Distinction 85%+). Plus a 30-second shortcut-key game.

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| Page looks unstyled | Make sure you opened the **folder**, not a single file, and that `css/` is next to the HTML files |
| Fonts look plain | The fonts load from Google Fonts – they need internet. The site still works without them, and the certificate falls back to built-in fonts |
| Certificate didn't download | Check the browser's Downloads (it's saved as `Photoshop-Skills-Lab-Award-Name.pdf`). Some school PCs ask where to save |
| "Go Live" button missing | Reinstall Live Server, then reload VS Code (`Ctrl+Shift+P` › *Reload Window*) |
| Port already in use | Click the port number in the bottom bar to stop Live Server, then Go Live again |
| Playground feels slow on a big photo | Photos are shrunk to 1200 px wide automatically; on older PCs use smaller images |

## 8. Updating the site on GitHub

1. Open your repository on github.com.
2. Click **Add file › Upload files**.
3. Open the unzipped `photoshop-skills-lab` folder, select everything **inside** it (`Ctrl+A`) and drag it onto the page.
4. Click **Commit changes**. Files with the same name are replaced automatically.
5. Wait 1–2 minutes, then refresh your site (`Ctrl+F5`).

## Credits

Icons: [Material Design Icons](https://pictogrammers.com/library/mdi/) by Pictogrammers (free licence), stored in `js/icons.js`.
