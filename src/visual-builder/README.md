# Visual Website Builder

A Canva-like visual website builder with drag-and-drop, inline editing, and real-time code sync.

## Features

- **Left Panel**: Component library (Hero, Navbar, Cards, Forms, Text, Heading, Image, Button, Columns)
- **Center Canvas**: Live editable canvas with drag & drop
- **Right Panel**: Properties editor (content, colors, fonts, padding, margins)
- **Inline editing**: Click text/heading/button to edit directly
- **JSON schema**: Page structure stored as JSON, export with one click
- **Undo/Redo**: Full history support

## Tech Stack

- React + Vite
- TailwindCSS
- Zustand (state management)
- JSON schema for page structure

## Usage

1. Visit `/visual-builder` or click "Visual Builder" in the nav
2. Drag components from the left panel onto the canvas
3. Click any element to select and edit in the right panel
4. Edit text inline by clicking and typing
5. Use Export JSON to copy the page schema

## Folder Structure

```
visual-builder/
├── components/     # ElementRenderer
├── editor/         # ComponentLibrary, PropertiesPanel
├── canvas/         # EditableCanvas
├── state/          # store, schema, templates
└── pages/          # VisualBuilderPage
```
