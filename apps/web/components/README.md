# Design System Components

This directory contains the complete UI component library for the Accountant application, built with Tailwind CSS and shadcn/ui.

## Base Components (37 components)

All components are located in `components/ui/` and follow the design system tokens defined in `lib/design-tokens.ts`.

### Form & Input Components (11)
- `Button` - Primary, secondary, ghost, outline variants with sizes
- `Input` - Text, number, with validation states
- `Label` - Form labels with consistent styling
- `Textarea` - Multi-line text input
- `Select` - Dropdown menus
- `Checkbox` - Form checkboxes
- `RadioGroup` - Radio button groups
- `Switch` - Toggle switches
- `Slider` - Range slider input
- `Calendar` - Date picker calendar
- `DatePicker` - Date selection component (Popover + Calendar)

### Layout & Container Components (4)
- `Card` - Container for content sections
- `Separator` - Visual dividers
- `ScrollArea` - Custom scrollable containers
- `Sheet` - Side panel/sheet component

### Feedback & Status Components (5)
- `Alert` - Status messages (success, error, warning, info)
- `Badge` - Status indicators, tags
- `Skeleton` - Loading placeholders
- `Progress` - Progress bars
- `Toast` / `Toaster` - Toast notifications

### Navigation & Menu Components (4)
- `Tabs` - Tab navigation
- `DropdownMenu` - Context menus
- `Menubar` - Menu bar component
- `Breadcrumb` - Breadcrumb navigation

### Overlay & Dialog Components (5)
- `Dialog` - Modal dialogs
- `Popover` - Popover containers
- `Tooltip` - Hover tooltips
- `HoverCard` - Hover card component
- `ContextMenu` - Right-click context menus

### Data Display Components (3)
- `Table` - Data tables with sorting/filtering support
- `Avatar` - User avatar component
- `Command` - Command palette/search

### Interactive Components (5)
- `Toggle` - Toggle button
- `ToggleGroup` - Toggle button groups
- `Accordion` - Collapsible content sections
- `Collapsible` - Collapsible content
- `NavigationMenu` - Navigation menu with submenus

## Design Tokens

All components use the design tokens defined in `lib/design-tokens.ts`:

- **Colors**: Primary (P1), Secondary (P2), Tertiary (P3), semantic colors
- **Spacing**: xs, sm, md, lg, xl, 2xl
- **Typography**: Sans and mono font families
- **Shadows**: sm, md, lg, xl
- **Border Radius**: sm, md, lg, xl
- **Transitions**: fast, base, slow

## Usage Example

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## Accessibility

All components are built on Radix UI primitives and meet WCAG 2.1 AA standards:
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA attributes

## Responsive Design

All components are mobile-first and include:
- Touch-friendly targets (minimum 44px)
- Responsive layouts
- Mobile-optimized interactions

