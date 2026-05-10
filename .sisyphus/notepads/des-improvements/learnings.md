# CreaTech DES Improvement Learnings

## Conventions
- Use `@/` path aliases for imports
- Tailwind CSS 4 with `@theme` for custom colors
- React 19 + Next.js 16 App Router
- "use client" for client components
- L&T brand colors: #0077c8 (ltblue), #00447c (ltdark)

## Gotchas
- SiteSimulationContext is a god object (~580 lines, 30+ state values)
- Three.js Canvas uses dynamic import with ssr: false
- Backend is single-file FastAPI (main.py)
- Supabase integration with schema-specific tables
- Ollama integration for local LLM chat

## Decisions
- Skip security fixes per user request
- Focus on performance, UX, code quality, architecture
- Use micro commits after each verified task
