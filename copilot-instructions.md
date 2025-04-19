# Copilot Instructions for Pokémon Card Search App

## Project Overview

- This project is a Pokémon card search engine.
- The current stack is React Native with Expo.
- The app queries a local Pokémon card database (SQLite) with complex filters and displays relevant card information.

## File & Folder Structure

- Place all form input components in `components/formInputs/`, one file per input type.
- Place composed forms in `components/forms/`.
- Place all TypeScript type declarations in `types/`.
- Database files are in `db/`.
- Styles are in `style/`.

## Database

- Use the `expo-sqlite` package to interact with the local SQLite database.
- Place the pre-populated database file in the `assets/db/` folder.
- Open and query the database using Expo's SQLite API.

## General

- Write clear, concise comments for complex logic.
- Keep code readable and maintainable.
- Follow this file for Copilot and human contributions.

## Formatting

- Use the `export function` syntax for all React component definitions.
- Always use the `@` symbol for path aliases when importing local files (e.g., `import ... from "@/components/...").
