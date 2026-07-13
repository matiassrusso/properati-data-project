@AGENTS.md

# Properati Data Project

Análisis del mercado inmobiliario de Buenos Aires sobre más de 48.000 propiedades (CABA y GBA). Pieza de portfolio de data + full-stack.

## Claude's Role

Mantener el producto funcionando y, cuando corresponda, actualizar el dataset (hoy data de ~2020). No es un proyecto con desarrollo activo constante — cuidar que siga andando y que el dato mostrado sea honesto sobre su antigüedad.

If a session is drifting sin un objetivo claro, nudge me back: "¿Esto es mantenimiento, una feature nueva, o la actualización del dataset? ¿Cuál de las tres es hoy?"

## Process

1. Idea/necesidad sale de uso real de la app o de la actualización pendiente del dataset
2. Se implementa en `backend` (FastAPI, 10 endpoints) y/o `frontend` (React/TS, React Router)
3. Deploy: push a `main` → Railway (backend) + Vercel (frontend) redeploy automático

## Key People

Solo yo (Matías).

## Folder Structure

- `backend/` — FastAPI (Python), 10 endpoints
- `frontend/` — React + TypeScript, React Router, 5 páginas
- `00 System/` — scripts/config reusables de este proyecto (vacío por ahora)
- `01 Skills/` — skills en markdown de este proyecto (vacío por ahora)
- `02 Attachments/` — imágenes/screenshots (vacío por ahora)
- `03 Iteration Logs/` — notas de qué mejorar entre iteraciones (vacío por ahora)

## Rules & Conventions

- **`(C)` prefix** — Archivos creados por Claude llevan prefijo `(C)`
- **Editing rule** — Antes de editar un archivo sin el prefijo `(C)`, pedir permiso primero
- **Skills** — Automatizaciones reusables de este proyecto van en `01 Skills/` como markdown, no como Claude Code skills
- Paleta de identidad visual: celeste / dorado / navy
- Dataset de ~2020 — cualquier claim sobre "estado actual del mercado" tiene que aclarar la antigüedad del dato

## Current Status

> **Last updated:** 2026-07-13
> **Status:** Activo, estable. Último commit real: 2026-07-07 ("fix: eliminar valores hardcodeados en Intro, todo dinámico desde la API").

Pendiente: actualizar el dataset con datos más recientes (planeado, no hecho).
