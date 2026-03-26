# UI Coding Standards

## Component Library

**All UI components must use [shadcn/ui](https://ui.shadcn.com/) exclusively.**

- Do **not** create custom UI components (buttons, inputs, dialogs, cards, badges, etc.)
- Do **not** use any other component library (e.g. Radix primitives directly, Headless UI, MUI, Chakra)
- If a shadcn/ui component does not exist for a given UI element, request the addition of one — do not hand-roll it
- Components are installed via the CLI (`npx shadcn@latest add <component>`) and live in `components/ui/`

### Composing Pages

Build pages and features by composing shadcn/ui primitives together. Wrapper components are allowed only when they encapsulate **business logic**, not visual styling.

**Allowed:**
```tsx
// Composing shadcn primitives
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WorkoutCard({ workout }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Start</Button>
      </CardContent>
    </Card>
  )
}
```

**Not allowed:**
```tsx
// Custom UI component — do not do this
export function MyButton({ children }) {
  return <button className="rounded bg-blue-500 px-4 py-2 text-white">{children}</button>
}
```

---

## Date Formatting

All date formatting must use **[date-fns](https://date-fns.org/)**.

### Required Format

Dates displayed to users must follow this pattern:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Mar 2026
```

### Implementation

Use `format` with the `do` token for ordinal day numbers:

```ts
import { format } from "date-fns"

format(date, "do MMM yyyy")
// → "1st Sep 2025"
// → "2nd Aug 2025"
// → "23rd Mar 2026"
```

Do **not** use:
- `Date.prototype.toLocaleDateString()`
- `Intl.DateTimeFormat`
- Manual string concatenation to build dates
- Any other date library (e.g. `dayjs`, `moment`)
