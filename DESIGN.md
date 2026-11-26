---
name: On Call Hub
description: Shift scheduling for Frens Ice Cream; owner on desktop, workers on phones.
colors:
  action-blue: "#0050D3"
  action-blue-deep: "#003FA7"
  scoop-orange: "#FD950F"
  night-navy: "#012247"
  ink-navy: "#0B2A4A"
  go-green: "#1FAA59"
  stop-red: "#FF0000"
  blue-wash: "#E6EFFD"
  pill-blue: "#C9DAF8"
  orange-wash: "#FEF3E6"
  green-wash: "#E3F4E6"
  red-wash: "#FBDEDE"
  hairline: "#E5E5E5"
  divider-grey: "#D9D9D9"
  quiet-grey: "#737373"
  paper: "#FFFFFF"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  page: "32px"
  page-wide: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-deep}"
  button-danger:
    backgroundColor: "{colors.stop-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "20px"
  status-pill:
    backgroundColor: "{colors.pill-blue}"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.full}"
    padding: "2px 12px"
  input:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  nav-item:
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  nav-item-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.night-navy}"
---

# Design System: On Call Hub

## Overview

**Creative North Star: "The Shift Board"**

On Call Hub reads like the board on the shop wall: a dark navy frame, a white surface, and every shift pinned up where anyone can see whether it's covered. The design exists to show where a shift stands, at a glance, on a desktop for the owner and on a phone for a worker standing in a queue somewhere. Nothing here is decorative for its own sake; the one warm, playful note is the ice-cream photography and orange greeting on the dashboard hero.

Density is moderate. Content sits in rounded white cards with a thin grey outline and a soft lift, grouped into a single column on phones and two columns (main plus a narrow side rail) on desktop. Headings and labels are set in bold capitals so the board can be scanned from across the room; sentences stay in normal case so they can be read.

Colour carries meaning, not mood. Blue is what you press, orange is what you notice, green is done, red is a problem. Each status also gets a pale wash of its own hue so a whole card or row can be tinted without shouting.

**Key Characteristics:**
- Navy sidebar frame, white working canvas.
- Rounded, outlined white cards with a soft shadow.
- Bold capital headings and labels; normal-case sentences.
- Status shown as colour plus a pale wash of the same hue.
- One typeface (Geist) throughout.

## Colors

A navy-and-white board with blue for action and a small set of status hues, each paired with a pale wash.

### Primary
- **Action Blue** (`action-blue`): every button, link and "View All", plus the selected state on day chips and tabs. If it's blue, it can be pressed.
- **Deep Action Blue** (`action-blue-deep`): hover and pressed state for Action Blue, and the focus ring on inputs.

### Secondary
- **Scoop Orange** (`scoop-orange`): the attention colour. Greeting text, "pending" status, highlighted numbers and badges. It marks something to look at, never something to press.

### Tertiary
- **Go Green** (`go-green`): accepted, confirmed, available, approve.
- **Stop Red** (`stop-red`): cancelled, rejected, on leave, destructive buttons (log out, delete).

### Neutral
- **Night Navy** (`night-navy`): the sidebar background (the `--dark-blue` variable) and the header title and icons.
- **Ink Navy** (`ink-navy`): headings inside worker cards and summaries.
- **Paper** (`paper`): page and card background.
- **Hairline** (`hairline`): default card and input outline (the theme `--border`).
- **Divider Grey** (`divider-grey`): heavier dividers and table outlines.
- **Quiet Grey** (`quiet-grey`): secondary text, timestamps, empty-state messages.
- **Washes** (`blue-wash`, `pill-blue`, `orange-wash`, `green-wash`, `red-wash`): pale backgrounds that tint a card, row or stat tile in its status colour. `orange-wash` is also the document card colour and `red-wash` the emergency card colour.

### Named Rules
**The Blue Means Press Rule.** Action Blue is the only colour for interactive elements. Orange, green and red never appear as a primary button fill; green and red appear on buttons only when the button *is* the status (Approve, Reject, Log out).

**The Wash Pairing Rule.** A status colour used as text or outline sits on its own pale wash, never on another hue's wash.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist
**Label/Mono Font:** Geist (no separate mono)

**Character:** One neutral, modern sans doing all the work; hierarchy comes from weight and capitals, not from a second family.

### Hierarchy
- **Display** (800, 30px, 1.2): page heroes only, such as "GOOD DAY, JAMES!" and "MY SHIFTS". Capitals.
- **Headline** (700, 18px, 1.4): card titles, such as "THIS WEEK" and "RECENT ACTIVITY". Capitals.
- **Title** (700, 14px, 1.4): row titles, names, stat numbers' captions.
- **Body** (400, 14px, 1.5): sentences, descriptions, empty states. Normal case. Inputs use 16px on phones so iOS does not zoom.
- **Label** (700, 12px, slight tracking): table headers, pill text, stat captions, nav items. Capitals.

### Named Rules
**The Twelve Pixel Floor.** No text is smaller than 12px. The incumbent 8–11px sizes are a known defect (OCH-225), not part of the system.

**The Caps For Names Rule.** Capitals are for headings, labels, nav items and status pills. Sentences, descriptions, error messages and notification text stay in normal case (OCH-226).

## Layout

Two-part frame: a fixed navy sidebar (320px open, 64px collapsed) on the left from 768px up, and a white canvas holding a header row and the page content, capped at 1152px and centred with 32px side padding (48px from 1024px). Below 768px the sidebar becomes a slide-in drawer behind a menu button in the top-left corner, and content becomes a single column with 16px side padding.

Dashboards use a main column plus a narrower right rail (summary, recent activity) on desktop, stacked on phones. Cards stack with 24px gaps; inside a card, 12–16px gaps separate rows and 8px separates tight groups. Spacing steps are 8, 12, 16 and 24px.

Breakpoints follow Tailwind: 640px (phone to large phone), 768px (sidebar appears), 1024px (wider page padding, two-column dashboards).

## Elevation & Depth

Mostly flat, with one soft lift. Cards sit on the white page with a thin outline plus a small, diffuse shadow so they read as pinned to the board. Nothing else floats except the mobile drawer, its dimmed backdrop, and dialogs.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 2px 6px rgba(0,0,0,0.12)`): standard content cards.
- **Subtle** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)`): form cards and small floating controls.
- **Overlay** (`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`): dialogs, modals and dropdown menus only. Dialogs use the larger 16px radius.

### Named Rules
**The One Lift Rule.** A card gets the card lift or nothing; don't stack bigger shadows to make one card louder. Use a wash or an outline colour instead.

## Shapes

Soft, friendly rounding everywhere, scaled to the size of the thing: 12px on cards, 8px on buttons, inputs, nav items and stat tiles, 6px on small icon buttons, and fully round on status pills, avatars and the carousel dots. Outlines are 1px; a 1px coloured outline on a wash is how stat tiles and selected chips show their state.

## Components

### Buttons
Plain and confident; blue fill, white bold text.
- **Shape:** gently rounded (8px).
- **Primary:** Action Blue fill, white bold text, 10px × 24px padding.
- **Hover / Focus:** fill deepens to Deep Action Blue (150ms colour transition).
- **Danger:** Stop Red fill, white text, for log out and delete confirmations.
- **Outline (secondary):** white or transparent fill, 1px Action Blue outline, Action Blue text.
- **Text link:** Action Blue, underlined ("View All").

### Status Pills
- **Style:** fully round, 12px bold capitals; pale blue (`pill-blue`) fill with navy text for table headers, or the status wash with a 1px status-colour outline and status-colour text (for example PENDING in Scoop Orange on `orange-wash`).

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Paper.
- **Shadow Strategy:** card lift (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 16px on phones, 20–24px from 640px.

### Stat Tiles
The signature of the dashboards: a small square tile with an icon, a big number and a capital caption, outlined in its status colour on that colour's wash (blue for available or total, red for leave, green for attendance or done, orange for busy or pending).

### Inputs / Fields
- **Style:** Paper fill, 1px Hairline outline, 8px radius, 12px × 16px padding, 16px text on phones and 14px from 640px.
- **Focus:** no browser outline; a 1px Deep Action Blue ring at 60% opacity.
- **Error / Disabled:** error text in Stop Red below the field; disabled controls drop to 50% opacity.

### Navigation
- **Sidebar:** Night Navy background, logo at top, items stacked with generous gaps. Each item is a 1px white outlined rounded box (8px) with icon and capital label in white. Hover and active both fill white with navy text; active stays filled. Log out sits at the bottom.
- **Header:** business name in bold capitals in Night Navy on the left; bell and profile icons on the right.
- **Phone:** sidebar becomes a drawer sliding in over a 40% black backdrop (300ms).

## Do's and Don'ts

### Do:
- **Do** use Action Blue for anything clickable, and only for that.
- **Do** pair each status colour with its own wash (orange on `orange-wash`, green on `green-wash`, red on `red-wash`, blue on `blue-wash`).
- **Do** put content in 12px-rounded white cards with a Hairline outline and the card lift.
- **Do** keep all text at 12px or above.
- **Do** set headings, labels, pills and nav items in bold capitals, and keep sentences in normal case.
- **Do** keep the navy sidebar plus white canvas frame on every signed-in page.
- **Do** meet WCAG 2.1 AA contrast; check status-colour text on white and on washes before shipping.

### Don't:
- **Don't** use Scoop Orange, green or red as a primary button fill.
- **Don't** set text below 12px (the incumbent 8–11px sizes are being removed in OCH-225).
- **Don't** put whole sentences, error messages or notification text in capitals.
- **Don't** introduce a second typeface.
- **Don't** stack heavier shadows to emphasise a card; use a wash or outline colour.
- **Don't** add new one-off hex colours; extend the palette here first.
