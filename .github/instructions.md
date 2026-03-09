# GitHub Copilot Instructions

> Engineering standards for this React JavaScript application. All generated code must comply with these guidelines.

---

## General Principles

1. **Functional components only** — No class components under any circumstances.
2. **Hooks-based architecture** — All stateful logic must use React hooks.
3. **Composition over inheritance** — Build features by composing small, focused components.
4. **Separation of concerns** — UI rendering, business logic, and data fetching must be separate.
5. **Single responsibility** — Each file/function should do one thing well.
6. **Explicit over implicit** — Prefer clear, readable code over clever abstractions.
7. **Fail fast** — Validate early, handle errors at boundaries.

---

## Project Architecture & Folder Structure

```
src/
├── assets/              # Static assets (images, fonts, icons)
├── components/          # Reusable UI components
│   ├── common/          # Shared primitives (Button, Input, Modal)
│   └── [feature]/       # Feature-specific components
├── hooks/               # Custom hooks (useAuth, useFetch, etc.)
├── services/            # API layer and external integrations
├── reducers/            # State management (Redux slices, context reducers)
├── utils/               # Pure utility functions
├── constants/           # App-wide constants and enums
├── pages/               # Route-level page components
├── layouts/             # Layout wrappers (Header, Sidebar, Footer)
└── App.jsx              # Root component
```

### Rules

- Components go in `components/`, never in `pages/`.
- Pages are thin wrappers that compose components.
- No business logic in components — extract to hooks or services.
- Utilities must be pure functions with no side effects.

---

## Component Guidelines

### Structure

```jsx
// Component file structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 1. Component definition
const MyComponent = ({ title, onSubmit }) => {
  // 2. Hooks first
  const [value, setValue] = useState('');

  // 3. Effects
  useEffect(() => {
    // side effect
  }, []);

  // 4. Handlers
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  // 5. Render
  return (
    <div>
      <h1>{title}</h1>
      <input value={value} onChange={handleChange} />
    </div>
  );
};

// 6. PropTypes (required)
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

// 7. Default props
MyComponent.defaultProps = {
  onSubmit: () => {},
};

export default MyComponent;
```

### Rules

- One component per file.
- File name must match component name exactly.
- Always define `PropTypes` for all props.
- Use `defaultProps` for optional props.
- Destructure props in function signature.
- Keep components under 150 lines — split if larger.
- No inline styles except for truly dynamic values.
- No anonymous functions in JSX when avoidable.

---

## State Management Rules

### Local State

- Use `useState` for simple, component-scoped state.
- Use `useReducer` for complex state with multiple sub-values.

### Global State

- Use Redux Toolkit for app-wide state.
- Keep slices small and focused.
- Never mutate state directly — use Immer patterns provided by Redux Toolkit.

### State Location Decision

| Scope | Solution |
|-------|----------|
| Single component | `useState` |
| Complex local state | `useReducer` |
| Parent-child (1-2 levels) | Props |
| Cross-cutting (auth, theme) | Context or Redux |
| Server state (API data) | Custom hooks with caching |

### Anti-patterns

```jsx
// ❌ Bad: Derived state stored separately
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0);

// ✅ Good: Derive from source of truth
const [items, setItems] = useState([]);
const itemCount = items.length;
```

---

## Custom Hooks Rules

### When to Extract

- Reusable stateful logic.
- Complex state management.
- Side effects that need cleanup.
- Abstracting third-party library usage.

### Naming

- Always prefix with `use` (e.g., `useAuth`, `useFetch`, `useDebounce`).

### Structure

```jsx
// hooks/useFetch.js
import { useState, useEffect } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
```

### Rules

- Hooks must be pure — no direct DOM manipulation.
- Always clean up subscriptions/timers in `useEffect` return.
- Return objects for multiple values, not arrays (unless order matters).
- Document hook parameters and return values.

---

## API & Service Layer Guidelines

### Structure

```jsx
// services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  return response.json();
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
```

### Rules

- **No `fetch` calls inside components** — always use service layer.
- Use `async/await` exclusively (no `.then()` chains).
- Centralize error transformation in the service layer.
- Store base URLs in environment variables.
- Create domain-specific service modules (e.g., `userService.js`, `productService.js`).

```jsx
// services/userService.js
import { api } from './api';

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
```

---

## Error Handling Strategy

### Component Level

```jsx
// Use error boundaries for rendering errors
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Wrap feature areas
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyFeature />
</ErrorBoundary>
```

### Async Operations

```jsx
// Always handle loading, error, and success states
const [state, setState] = useState({ data: null, loading: false, error: null });

const fetchData = async () => {
  setState((s) => ({ ...s, loading: true, error: null }));
  try {
    const data = await userService.getAll();
    setState({ data, loading: false, error: null });
  } catch (error) {
    setState((s) => ({ ...s, loading: false, error }));
  }
};
```

### Rules

- Never swallow errors silently.
- Log errors to monitoring service in production.
- Show user-friendly messages, not raw error text.
- Use error boundaries at route/feature level, not globally.

---

## Performance Guidelines

### Memoization

```jsx
// Use useMemo for expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Use useCallback for stable function references
const handleClick = useCallback((id) => {
  setSelected(id);
}, []);

// Use React.memo for pure components that receive stable props
const ListItem = React.memo(({ item, onClick }) => (
  <li onClick={() => onClick(item.id)}>{item.name}</li>
));
```

### Rules

- Don't prematurely optimize — profile first.
- Memoize callbacks passed to child components.
- Use `React.memo` for list items and frequently re-rendered components.
- Lazy load routes and heavy components with `React.lazy`.
- Avoid creating objects/arrays in render (move to useMemo or outside).
- Use unique, stable `key` props — never use array index as key.

```jsx
// ❌ Bad
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ Good
{items.map((item) => <Item key={item.id} {...item} />)}
```

---

## Styling Conventions

### Approach

- **Tailwind CSS v4 only** — no CSS Modules, no CSS-in-JS, no external CSS frameworks.
- Configuration lives in CSS via `@theme`, not in `tailwind.config.js`.
- All design tokens are exposed as CSS custom properties (`--color-*`, `--spacing-*`, etc.).

### Theme Configuration

```css
/* index.css */
@import "tailwindcss";

@theme {
  /* Semantic color tokens */
  --color-primary: oklch(0.7 0.15 250);
  --color-surface: oklch(0.98 0 0);
  --color-surface-dark: oklch(0.15 0 0);

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Utility Class Usage

```jsx
// ❌ Bad: Appearance-based or inline styles
<div style={{ backgroundColor: 'blue' }}>
<div className="bg-blue-500 text-xl font-bold p-4 rounded">

// ✅ Good: Semantic, purposeful utilities
<div className="bg-primary text-surface-dark text-xl font-bold p-4 rounded-lg">

// ✅ Good: Composition over repetition
const cardBase = 'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm';
<div className={cardBase}>
```

### Responsive Design (Mobile-First)

```jsx
// ✅ Mobile-first: base → sm → md → lg
<div className="w-full md:w-1/2 lg:w-1/3">
<p className="text-sm md:text-base lg:text-lg">
```

### Container Queries (Prefer over Breakpoints for Components)

```jsx
// ✅ Use @container for component-level responsiveness
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3">
    {/* ... */}
  </div>
</div>
```

### Dark Mode

```jsx
// ✅ Use dark: variant
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
```

### Layout Patterns

| Pattern | Classes |
|---------|--------|
| Center both axes | `flex items-center justify-center` |
| Vertical stack | `flex flex-col gap-4` |
| Space between | `flex justify-between items-center` |
| Responsive grid | `grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]` |
| Sidebar layout | `grid grid-cols-[auto_1fr]` |

### Rules

- No inline styles except for truly dynamic values (e.g., `style={{ width: dynamicWidth }}`)
- Never use `!important`.
- No `@apply` — prefer extracting to a React component instead.
- No arbitrary values unless absolutely necessary; prefer design system scale.
- Never build class names with string interpolation (breaks purging): use full class names.
- Extract repeated class combos (3+ uses) into a component or a constant.

```jsx
// ❌ Bad: Dynamic string interpolation (breaks Tailwind purge)
<div className={`text-${color}-500`}>

// ✅ Good: Full class name
const colorMap = { error: 'text-red-500', success: 'text-green-500' };
<div className={colorMap[color]}>
```

---

## Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Components | PascalCase | `UserProfile.jsx` |
| Hooks | camelCase with `use` prefix | `useAuth.js` |
| Utilities | camelCase | `formatDate.js` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS` |
| Event handlers | `handle` + Event | `handleSubmit` |
| Boolean props | `is`, `has`, `should` prefix | `isLoading`, `hasError` |
| Services | camelCase + `Service` suffix | `userService.js` |
| Reducers | camelCase + `Slice` suffix | `authSlice.js` |

### File Naming

- Component files: `ComponentName.jsx`
- Test files: `ComponentName.test.jsx`
- Hook files: `useSomething.js`
- Global styles: `index.css` (Tailwind `@theme` config + base styles only)

---

## Security Best Practices

### Rules

1. **Never store secrets in code** — use environment variables.
2. **Sanitize user input** — never trust client data.
3. **Escape dynamic content** — React does this by default, don't bypass with `dangerouslySetInnerHTML`.
4. **Validate on server** — client validation is for UX only.
5. **Use HTTPS** — enforce in production.
6. **Avoid `eval()`** — never execute dynamic strings as code.

```jsx
// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe (if HTML is needed, sanitize first)
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### Environment Variables

- Prefix with `VITE_` for client exposure (Vite).
- Never commit `.env` files with secrets.
- Use `.env.example` for documentation.

---

## Anti-Patterns (What NOT to Do)

### ❌ Direct DOM Manipulation

```jsx
// Never do this
document.getElementById('myDiv').style.display = 'none';
```

### ❌ Mutating Props or State

```jsx
// Never do this
props.items.push(newItem);
state.count++;
```

### ❌ Fetch Inside Components

```jsx
// Never do this
const MyComponent = () => {
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);
};
```

### ❌ Prop Drilling Beyond 2 Levels

```jsx
// Avoid passing props through many layers
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} /> // Use context instead
    </Child>
  </Parent>
</GrandParent>
```

### ❌ Logic in JSX

```jsx
// ❌ Bad
return (
  <div>
    {items.filter(i => i.active).map(i => (
      <span>{i.name.toUpperCase()}</span>
    ))}
  </div>
);

// ✅ Good
const activeItems = items.filter(i => i.active);
return (
  <div>
    {activeItems.map(i => (
      <ItemDisplay key={i.id} item={i} />
    ))}
  </div>
);
```

### ❌ Giant Components

- If a component exceeds 150 lines, split it.
- If it has more than 5 useState calls, use useReducer or split.

### ❌ Index as Key

```jsx
// Never use index as key for dynamic lists
{items.map((item, i) => <Item key={i} />)} // ❌
```

---

## Preferred Design Patterns

### Compound Components

```jsx
const Tabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.Tab = ({ index, children }) => { /* ... */ };
Tabs.Panel = ({ index, children }) => { /* ... */ };
```

### Render Props (When Needed)

```jsx
const DataFetcher = ({ url, render }) => {
  const { data, loading, error } = useFetch(url);
  return render({ data, loading, error });
};
```

### Container/Presenter

```jsx
// Container (logic)
const UserListContainer = () => {
  const { data, loading } = useFetch('/users');
  return <UserList users={data} loading={loading} />;
};

// Presenter (UI only)
const UserList = ({ users, loading }) => {
  if (loading) return <Loader />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};
```

### Custom Hooks for Logic Extraction

```jsx
// Extract complex logic to hooks
const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  // validation logic...
  return { values, errors, handleChange, handleSubmit };
};
```

---

## Code Quality Expectations

### Required

- All components must have PropTypes.
- All functions should have clear, single purposes.
- No commented-out code in commits.
- No `console.log` in production code.
- No `eslint-disable` without documented reason.

### Testing

- Unit test utility functions.
- Integration test critical user flows.
- Test custom hooks with `@testing-library/react-hooks`.

### Code Review Checklist

- [ ] PropTypes defined for all props
- [ ] No direct API calls in components
- [ ] Error states handled
- [ ] Loading states handled
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Keys are stable and unique
- [ ] No hardcoded strings (use constants)
- [ ] Accessible (semantic HTML, ARIA where needed)

---

## Prompt Logging (Mandatory)

Every user prompt submitted in this repository's AI chat **must be logged** to `my_prompts.md` at the root of the project.

### Format

```markdown
- **YYYY-MM-DD**: <prompt text>
```

### Rules

- Append each new prompt under the correct date heading (`## YYYY-MM-DD`).
- If the date heading does not exist, create it.
- Log the prompt **as-is** — do not paraphrase or summarize.
- This step is **non-optional** — every response must include this log update.
- The log file lives at: `my_prompts.md` (project root).

---

## Summary

This codebase prioritizes:

1. **Predictability** — Consistent patterns everywhere.
2. **Maintainability** — Easy to understand and modify.
3. **Separation** — UI, logic, and data are cleanly separated.
4. **Resilience** — Errors are handled gracefully.
5. **Performance** — Optimized where measured, not assumed.

All generated code must follow these standards without exception.
