# Copilot Instructions for Pokémon Card Search App

## Project Overview

- This project is a Pokémon card search engine.
- The current stack is Next.js (React), but the code should be easy to migrate to React Native.
- The app queries a local Pokémon card database with complex filters and displays relevant card information.

## File & Folder Structure

- Place all form input components in `components/formInputs/`, one file per input type.
- Place composed forms in `components/forms/`.
- Place all TypeScript type declarations in `types/`.
- API routes are in `pages/api/`.
- Database files are in `db/`.
- Styles are in `styles/` (see below for variables and mixins).

## Coding Conventions

- Use functional React components and hooks.
- Keep components small and focused (one responsibility per file).
- Use TypeScript for all code.
- Use prop types and interfaces for all components.
- Prefer composition over inheritance.
- Use 'use client' at the top of any file that uses React state or effects in Next.js.
- Do not add 'use client' to child components if the parent already has it.

## Styling

- The `styles/base/` folder contains global SCSS resources used throughout the project.
- Use variables from `styles/base/variables.scss` for all colors, font sizes, and paddings to ensure consistency.
- Use mixins from `styles/base/media-queries.scss` for all responsive breakpoints and media queries.
- Use mixins from `styles/base/mixins.scss` for reusable style patterns (e.g., font sizes, hover/focus states).
- Import `styles/base/reset.scss` at the root of your main stylesheet to normalize browser styles.
- Use `styles/base/typography.scss` to set up base font and text styles for the application.

## Styles/Components Structure

- The `styles/components/` directory should mirror the structure of the `components/` directory in the project root. For
  every component or folder in `components/`, create a corresponding SCSS file or folder in `styles/components/` for
  maintainability and consistency.

## API & Data

- All search/filter logic should be handled in the API route, not in the UI.
- The form should collect filter values and send them to the API.
- The API should query the local SQLite DB and return matching cards.

## Migration to React Native

- Avoid Next.js-specific APIs in reusable components.
- Keep business logic and UI logic separate for easier migration.

## General

- Write clear, concise comments for complex logic.
- Keep code readable and maintainable.
- Follow this file for Copilot and human contributions.

---

Feel free to expand or update these instructions as the project evolves.
