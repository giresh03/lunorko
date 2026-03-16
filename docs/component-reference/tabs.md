# Tabs Component Reference

**Base:** Radix UI  
**Style:** radix-nova (shadcn/ui)  
**Use for:** tabs, tabbed interface, switch views, segmented content

## Installation

```bash
npx shadcn@latest add tabs
```

## Component Source

Location: `src/components/ui/tabs.tsx`

```tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

## Usage Examples

### Basic

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for tab 1</TabsContent>
  <TabsContent value="tab2">Content for tab 2</TabsContent>
</Tabs>
```

### Controlled (with state)

```tsx
const [activeTab, setActiveTab] = useState("forum");

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="forum" className="gap-1.5">
      <PenSquare className="h-4 w-4" /> Forum
    </TabsTrigger>
    <TabsTrigger value="chat" className="gap-1.5">
      <MessageCircle className="h-4 w-4" /> Live Chat
    </TabsTrigger>
  </TabsList>
  <TabsContent value="forum">{/* ... */}</TabsContent>
  <TabsContent value="chat">{/* ... */}</TabsContent>
</Tabs>
```

### With icons in triggers

```tsx
<TabsTrigger value="overview" className="gap-1.5">
  <LayoutDashboard className="h-4 w-4" /> Overview
</TabsTrigger>
```

### Full-width bordered (underline style)

```tsx
<TabsList className="mb-8 w-full justify-start border-b border-border bg-transparent p-0 rounded-none">
  <TabsTrigger value="guidance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
    Guidance
  </TabsTrigger>
  <TabsTrigger value="editor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
    Editor
  </TabsTrigger>
</TabsList>
```

### Wrapped list (for many tabs)

```tsx
<TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
  {items.map((item) => (
    <TabsTrigger key={item.id} value={item.id}>
      {item.label}
    </TabsTrigger>
  ))}
</TabsList>
```

## API

- **Tabs**: `defaultValue`, `value`, `onValueChange`, `orientation`
- **TabsList**: `className` for layout (e.g. `w-full`, `flex-wrap`)
- **TabsTrigger**: `value` (required), `disabled`
- **TabsContent**: `value` (required), `forceMount`
