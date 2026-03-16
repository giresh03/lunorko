# Accordion Component Reference

**Base:** Radix UI  
**Style:** radix-nova (shadcn/ui)  
**Use for:** FAQ, expandable sections, collapsible content, vertically stacked headings

## Installation

```bash
npx shadcn@latest add accordion
```

## Component Source

Location: `src/components/ui/accordion.tsx`

```tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

## Usage Examples

### Basic (single open)

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### FAQ with bordered cards

```tsx
<Accordion type="single" collapsible className="space-y-3">
  {faqs.map((faq, i) => (
    <AccordionItem
      key={i}
      value={`faq-${i}`}
      className="rounded-lg border border-border bg-card px-6 transition-colors hover:border-primary/30"
    >
      <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
        {faq.q}
      </AccordionTrigger>
      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
        {faq.a}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### Multiple items open

```tsx
<Accordion type="multiple" className="space-y-2">
  {/* items */}
</Accordion>
```

### Disabled item

```tsx
<AccordionItem value="item-1" disabled>
  ...
</AccordionItem>
```

## API

- **Accordion**: `type="single" | "multiple"`, `collapsible`, `defaultValue`, `value`, `onValueChange`
- **AccordionItem**: `value` (required), `disabled`
- **AccordionTrigger**: standard button props
- **AccordionContent**: standard div props
