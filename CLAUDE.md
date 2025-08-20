# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 CMS application using the App Router architecture with TypeScript, Tailwind CSS v4, and Supabase integration.

## Essential Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint checks
```

## Architecture

### Tech Stack
- **Next.js 15.4.7** with App Router (`/src/app/`)
- **React 19.1.0**
- **TypeScript** with strict mode and path aliases (`@/*` maps to `./src/*`)
- **Tailwind CSS v4** (new CSS-first approach, configured in `globals.css`)
- **Supabase** for database/auth (credentials in `.env.local`)

### Project Structure
```
src/app/           # App Router pages and layouts
  layout.tsx       # Root layout with fonts and global styles
  page.tsx         # Homepage
  globals.css      # Tailwind directives and CSS variables
public/            # Static assets
```

### Key Patterns
- Server Components by default in App Router
- CSS custom properties for theming with dark mode support
- Geist font family loaded via `next/font`
- TypeScript path aliases: use `@/` for imports from `src/`

## Development Guidelines

### When Adding Features
1. Place new pages/routes in `src/app/`
2. Use Server Components by default, Client Components only when needed (interactive features)
3. Follow existing Tailwind v4 patterns in `globals.css`
4. Maintain TypeScript strict mode compliance

### Supabase Integration
- URL and anon key are configured in `.env.local`
- Initialize Supabase client for database operations
- Use for authentication, data storage, and real-time features

### Code Style
- ESLint configured with Next.js and TypeScript rules
- No Prettier config present - follow existing code formatting
- Use TypeScript for all new files

## Next.js App Router Best Practices (v15)

### Component Patterns
- **Server Components by default**: Only add `'use client'` when you need interactivity, event handlers, or browser APIs
- **Async Server Components**: Use async/await directly in Server Components for data fetching
- **Client Component boundaries**: Keep Client Components small and push them down the component tree
- **Component colocation**: Keep components close to where they're used in the app directory

### Data Fetching
- **Fetch in Server Components**: Use native fetch() with Next.js caching extensions
- **Parallel data fetching**: Use Promise.all() or separate async components for parallel requests
- **Request deduplication**: Next.js automatically deduplicates identical fetch requests
- **Streaming and Suspense**: Use loading.tsx and Suspense boundaries for progressive rendering

### Routing and Navigation
- **File-based routing**: Use folders for routes, special files (page.tsx, layout.tsx, loading.tsx, error.tsx)
- **Dynamic routes**: Use [param] folders for dynamic segments, [...slug] for catch-all routes
- **Parallel routes**: Use @folder notation for rendering multiple pages simultaneously
- **Intercepting routes**: Use (.) notation for modal patterns and progressive enhancement
- **Route groups**: Use (folder) notation to organize routes without affecting URL structure

### Performance Optimization
- **Partial Prerendering (PPR)**: Combine static and dynamic rendering in the same route
- **Static exports**: Use `output: 'export'` in next.config.ts for fully static sites when possible
- **Image optimization**: Always use next/image for automatic optimization
- **Font optimization**: Use next/font for automatic font optimization and layout shift prevention
- **Link prefetching**: Use next/link for automatic prefetching of routes

### State and Cache Management
- **Server Actions**: Use for mutations and form submissions (mark with `'use server'`)
- **Route segment config**: Export config options like `revalidate`, `dynamic`, `fetchCache`
- **Cache control**: Use fetch() cache and revalidate options, or unstable_cache for non-fetch data
- **Client state**: Use React hooks for client-side state, consider Zustand for complex state

### SEO and Metadata
- **Metadata API**: Export metadata object or generateMetadata function in page.tsx/layout.tsx
- **Dynamic metadata**: Use generateMetadata for dynamic OG images and SEO
- **Sitemap and robots**: Use sitemap.ts and robots.ts in app directory

### Error Handling
- **error.tsx**: Catch errors in route segments (must be Client Component)
- **global-error.tsx**: Catch errors in root layout
- **not-found.tsx**: Handle 404 errors with notFound() function

### Forms and Mutations
- **Server Actions**: Preferred for form handling - progressive enhancement works without JS
- **useFormStatus**: Hook for pending states in form submissions
- **useFormState**: Hook for server action state management
- **Validation**: Validate on server, use zod or similar for schema validation

## Important Notes
- No testing framework currently installed
- Tailwind v4 uses a different configuration approach than v3 (CSS-based, not JS config)
- App Router patterns differ from Pages Router - use modern Next.js 13+ conventions