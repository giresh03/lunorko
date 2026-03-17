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

##accordion 
---
title: Accordion
description: A vertically stacked set of interactive headings that each reveal a section of content.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/primitives/docs/components/accordion
  api: https://www.radix-ui.com/primitives/docs/components/accordion#api-reference
---

<ComponentPreview
  name="accordion-demo"
  styleName="radix-nova"
  align="start"
  previewClassName="*:data-[slot=accordion]:max-w-sm h-[300px]"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>

<TabsContent value="cli">

```bash
npx shadcn@latest add accordion
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="accordion"
  title="components/ui/accordion.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
```

```tsx showLineNumbers
<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## Examples

### Basic

A basic accordion that shows one item at a time. The first item is open by default.

<ComponentPreview
  name="accordion-basic"
  styleName="radix-nova"
  align="start"
  previewClassName="*:data-[slot=accordion]:max-w-sm h-[300px]"
/>

### Multiple

Use `type="multiple"` to allow multiple items to be open at the same time.

<ComponentPreview
  name="accordion-multiple"
  styleName="radix-nova"
  align="start"
  previewClassName="*:data-[slot=accordion]:max-w-sm h-[36rem] md:h-[30rem]"
/>

### Disabled

Use the `disabled` prop on `AccordionItem` to disable individual items.

<ComponentPreview
  name="accordion-disabled"
  styleName="radix-nova"
  align="start"
  previewClassName="*:data-[slot=accordion]:max-w-sm h-[300px]"
/>

### Borders

Add `border` to the `Accordion` and `border-b last:border-b-0` to the `AccordionItem` to add borders to the items.

<ComponentPreview
  name="accordion-borders"
  styleName="radix-nova"
  align="start"
  previewClassName="*:data-[slot=accordion]:max-w-sm h-96 md:h-80"
/>

### Card

Wrap the `Accordion` in a `Card` component.

<ComponentPreview
  name="accordion-card"
  styleName="radix-nova"
  align="start"
  previewClassName="*:data-[slot=accordion]:max-w-sm h-[32rem] md:h-[28rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="accordion-rtl"
  align="start"
  direction="rtl"
/>

## API Reference

See the [Radix UI](https://www.radix-ui.com/primitives/docs/components/accordion#api-reference) documentation for more information.

## alert
---
title: Alert
description: Displays a callout for user attention.
base: radix
component: true
---

<ComponentPreview
  name="alert-demo"
  styleName="radix-nova"
  previewClassName="h-auto sm:h-72 p-6"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add alert
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="alert"
  title="components/ui/alert.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
```

```tsx showLineNumbers
<Alert>
  <InfoIcon />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the cli.
  </AlertDescription>
  <AlertAction>
    <Button variant="outline">Enable</Button>
  </AlertAction>
</Alert>
```

## Examples

### Basic

A basic alert with an icon, title and description.

<ComponentPreview
  name="alert-basic"
  styleName="radix-nova"
  previewClassName="h-auto sm:h-72 p-6"
/>

### Destructive

Use `variant="destructive"` to create a destructive alert.

<ComponentPreview
  name="alert-destructive"
  styleName="radix-nova"
  previewClassName="h-auto sm:h-72 p-6"
/>

### Action

Use `AlertAction` to add a button or other action element to the alert.

<ComponentPreview
  name="alert-action"
  styleName="radix-nova"
  previewClassName="h-auto sm:h-72 p-6"
/>

### Custom Colors

You can customize the alert colors by adding custom classes such as `bg-amber-50 dark:bg-amber-950` to the `Alert` component.

<ComponentPreview
  name="alert-colors"
  styleName="radix-nova"
  previewClassName="h-auto sm:h-72 p-6"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="alert-rtl"
  direction="rtl"
  previewClassName="h-auto sm:h-72 p-6"
/>

## API Reference

### Alert

The `Alert` component displays a callout for user attention.

| Prop      | Type                         | Default     |
| --------- | ---------------------------- | ----------- |
| `variant` | `"default" \| "destructive"` | `"default"` |

### AlertTitle

The `AlertTitle` component displays the title of the alert.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### AlertDescription

The `AlertDescription` component displays the description or content of the alert.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### AlertAction

The `AlertAction` component displays an action element (like a button) positioned absolutely in the top-right corner of the alert.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

## alert dialog
---
title: Alert Dialog
description: A modal dialog that interrupts the user with important content and expects a response.
featured: true
base: radix
component: true
links:
  doc: https://www.radix-ui.com/primitives/docs/components/alert-dialog
  api: https://www.radix-ui.com/primitives/docs/components/alert-dialog#api-reference
---

<ComponentPreview
  name="alert-dialog-demo"
  styleName="radix-nova"
  previewClassName="h-56"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add alert-dialog
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="alert-dialog"
  title="components/ui/alert-dialog.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
```

```tsx showLineNumbers
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Show Dialog</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Examples

### Basic

A basic alert dialog with a title, description, and cancel and continue buttons.

<ComponentPreview
  name="alert-dialog-basic"
  styleName="radix-nova"
  previewClassName="h-56"
/>

### Small

Use the `size="sm"` prop to make the alert dialog smaller.

<ComponentPreview
  name="alert-dialog-small"
  styleName="radix-nova"
  previewClassName="h-56"
/>

### Media

Use the `AlertDialogMedia` component to add a media element such as an icon or image to the alert dialog.

<ComponentPreview
  name="alert-dialog-media"
  styleName="radix-nova"
  previewClassName="h-56"
/>

### Small with Media

Use the `size="sm"` prop to make the alert dialog smaller and the `AlertDialogMedia` component to add a media element such as an icon or image to the alert dialog.

<ComponentPreview
  name="alert-dialog-small-media"
  styleName="radix-nova"
  previewClassName="h-56"
/>

### Destructive

Use the `AlertDialogAction` component to add a destructive action button to the alert dialog.

<ComponentPreview
  name="alert-dialog-destructive"
  styleName="radix-nova"
  previewClassName="h-56"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="alert-dialog-rtl"
  direction="rtl"
  previewClassName="h-56"
/>

## API Reference

### size

Use the `size` prop on the `AlertDialogContent` component to control the size of the alert dialog. It accepts the following values:

| Prop   | Type                | Default     |
| ------ | ------------------- | ----------- |
| `size` | `"default" \| "sm"` | `"default"` |

For more information about the other components and their props, see the [Radix UI documentation](https://www.radix-ui.com/primitives/docs/components/alert-dialog#api-reference).

## aspect ratio
---
title: Aspect Ratio
description: Displays content within a desired ratio.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/primitives/docs/components/aspect-ratio
  api: https://www.radix-ui.com/primitives/docs/components/aspect-ratio#api-reference
---

<ComponentPreview name="aspect-ratio-demo" styleName="radix-nova" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add aspect-ratio
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="aspect-ratio"
  title="components/ui/aspect-ratio.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { AspectRatio } from "@/components/ui/aspect-ratio"
```

```tsx showLineNumbers
<AspectRatio ratio={16 / 9}>
  <Image src="..." alt="Image" className="rounded-md object-cover" />
</AspectRatio>
```

## Examples

### Square

A square aspect ratio component using the `ratio={1 / 1}` prop. This is useful for displaying images in a square format.

<ComponentPreview name="aspect-ratio-square" styleName="radix-nova" />

### Portrait

A portrait aspect ratio component using the `ratio={9 / 16}` prop. This is useful for displaying images in a portrait format.

<ComponentPreview
  name="aspect-ratio-portrait"
  styleName="radix-nova"
  previewClassName="h-96"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="aspect-ratio-rtl"
  direction="rtl"
  previewClassName="h-96"
/>

## API Reference

### AspectRatio

The `AspectRatio` component displays content within a desired ratio.

| Prop        | Type     | Default | Required |
| ----------- | -------- | ------- | -------- |
| `ratio`     | `number` | -       | Yes      |
| `className` | `string` | -       | No       |

For more information, see the [Radix UI documentation](https://www.radix-ui.com/primitives/docs/components/aspect-ratio#api-reference).

## avatar
---
title: Avatar
description: An image element with a fallback for representing the user.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/primitives/docs/components/avatar
  api: https://www.radix-ui.com/primitives/docs/components/avatar#api-reference
---

<ComponentPreview styleName="radix-nova" name="avatar-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add avatar
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="avatar"
  title="components/ui/avatar.tsx"

/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
```

```tsx showLineNumbers
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

## Examples

### Basic

A basic avatar component with an image and a fallback.

<ComponentPreview styleName="radix-nova" name="avatar-basic" />

### Badge

Use the `AvatarBadge` component to add a badge to the avatar. The badge is positioned at the bottom right of the avatar.

<ComponentPreview styleName="radix-nova" name="avatar-badge" />

Use the `className` prop to add custom styles to the badge such as custom colors, sizes, etc.

```tsx showLineNumbers
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
  <AvatarBadge className="bg-green-600 dark:bg-green-800" />
</Avatar>
```

### Badge with Icon

You can also use an icon inside `<AvatarBadge>`.

<ComponentPreview
  name="avatar-badge-icon"
  styleName="radix-nova"

/>

### Avatar Group

Use the `AvatarGroup` component to add a group of avatars.

<ComponentPreview
  name="avatar-group"
  styleName="radix-nova"

/>

### Avatar Group Count

Use `<AvatarGroupCount>` to add a count to the group.

<ComponentPreview
  name="avatar-group-count"
  styleName="radix-nova"

/>

### Avatar Group with Icon

You can also use an icon inside `<AvatarGroupCount>`.

<ComponentPreview
  name="avatar-group-count-icon"
  styleName="radix-nova"

/>

### Sizes

Use the `size` prop to change the size of the avatar.

<ComponentPreview
  name="avatar-size"
  styleName="radix-nova"

/>

### Dropdown

You can use the `Avatar` component as a trigger for a dropdown menu.

<ComponentPreview styleName="radix-nova" name="avatar-dropdown" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="avatar-rtl"
  direction="rtl"
  previewClassName="h-72"
/>

## API Reference

### Avatar

The `Avatar` component is the root component that wraps the avatar image and fallback.

| Prop        | Type                        | Default     |
| ----------- | --------------------------- | ----------- |
| `size`      | `"default" \| "sm" \| "lg"` | `"default"` |
| `className` | `string`                    | -           |

### AvatarImage

The `AvatarImage` component displays the avatar image. It accepts all Radix UI Avatar Image props.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `src`       | `string` | -       |
| `alt`       | `string` | -       |
| `className` | `string` | -       |

### AvatarFallback

The `AvatarFallback` component displays a fallback when the image fails to load. It accepts all Radix UI Avatar Fallback props.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### AvatarBadge

The `AvatarBadge` component displays a badge indicator on the avatar, typically positioned at the bottom right.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### AvatarGroup

The `AvatarGroup` component displays a group of avatars with overlapping styling.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### AvatarGroupCount

The `AvatarGroupCount` component displays a count indicator in an avatar group, typically showing the number of additional avatars.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

For more information about Radix UI Avatar props, see the [Radix UI documentation](https://www.radix-ui.com/primitives/docs/components/avatar#api-reference).

## badge
---
title: Badge
description: Displays a badge or a component that looks like a badge.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="badge-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add badge
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource name="badge" title="components/ui/badge.tsx" />

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Badge } from "@/components/ui/badge"
```

```tsx
<Badge variant="default | outline | secondary | destructive">Badge</Badge>
```

## Examples

### Variants

Use the `variant` prop to change the variant of the badge.

<ComponentPreview styleName="radix-nova" name="badge-variants" />

### With Icon

You can render an icon inside the badge. Use `data-icon="inline-start"` to render the icon on the left and `data-icon="inline-end"` to render the icon on the right.

<ComponentPreview styleName="radix-nova" name="badge-icon" />

### With Spinner

You can render a spinner inside the badge. Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` prop to the spinner.

<ComponentPreview styleName="radix-nova" name="badge-spinner" />

### Link

Use the `asChild` prop to render a link as a badge.

<ComponentPreview styleName="radix-nova" name="badge-link" />

### Custom Colors

You can customize the colors of a badge by adding custom classes such as `bg-green-50 dark:bg-green-800` to the `Badge` component.

<ComponentPreview styleName="radix-nova" name="badge-colors" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="badge-rtl" direction="rtl" />

## API Reference

### Badge

The `Badge` component displays a badge or a component that looks like a badge.

| Prop        | Type                                                                          | Default     |
| ----------- | ----------------------------------------------------------------------------- | ----------- |
| `variant`   | `"default" \| "secondary" \| "destructive" \| "outline" \| "ghost" \| "link"` | `"default"` |
| `className` | `string`                                                                      | -           |

## breadcrumb
---
title: Breadcrumb
description: Displays the path to the current resource using a hierarchy of links.
base: radix
component: true
---

<ComponentPreview
  styleName="radix-nova"
  name="breadcrumb-demo"
  previewClassName="p-2"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add breadcrumb
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource name="breadcrumb" title="components/ui/breadcrumb.tsx" />

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
```

```tsx showLineNumbers
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Examples

### Basic

A basic breadcrumb with a home link and a components link.

<ComponentPreview styleName="radix-nova" name="breadcrumb-basic" />

### Custom separator

Use a custom component as `children` for `<BreadcrumbSeparator />` to create a custom separator.

<ComponentPreview styleName="radix-nova" name="breadcrumb-separator" />

### Dropdown

You can compose `<BreadcrumbItem />` with a `<DropdownMenu />` to create a dropdown in the breadcrumb.

<ComponentPreview styleName="radix-nova" name="breadcrumb-dropdown" />

### Collapsed

We provide a `<BreadcrumbEllipsis />` component to show a collapsed state when the breadcrumb is too long.

<ComponentPreview
  styleName="radix-nova"
  name="breadcrumb-ellipsis"
  previewClassName="p-2"
/>

### Link component

To use a custom link component from your routing library, you can use the `asChild` prop on `<BreadcrumbLink />`.

<ComponentPreview styleName="radix-nova" name="breadcrumb-link" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="breadcrumb-rtl"
  direction="rtl"
  previewClassName="p-2"
/>

## API Reference

### Breadcrumb

The `Breadcrumb` component is the root navigation element that wraps all breadcrumb components.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### BreadcrumbList

The `BreadcrumbList` component displays the ordered list of breadcrumb items.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### BreadcrumbItem

The `BreadcrumbItem` component wraps individual breadcrumb items.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### BreadcrumbLink

The `BreadcrumbLink` component displays a clickable link in the breadcrumb.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### BreadcrumbPage

The `BreadcrumbPage` component displays the current page in the breadcrumb (non-clickable).

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### BreadcrumbSeparator

The `BreadcrumbSeparator` component displays a separator between breadcrumb items. You can pass custom children to override the default separator icon.

| Prop        | Type              | Default |
| ----------- | ----------------- | ------- |
| `children`  | `React.ReactNode` | -       |
| `className` | `string`          | -       |

### BreadcrumbEllipsis

The `BreadcrumbEllipsis` component displays an ellipsis indicator for collapsed breadcrumb items.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

## button
---
title: Button
description: Displays a button or a component that looks like a button.
featured: true
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="button-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add button
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="button"
  title="components/ui/button.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Button } from "@/components/ui/button"
```

```tsx
<Button variant="outline">Button</Button>
```

## Cursor

Tailwind v4 [switched](https://tailwindcss.com/docs/upgrade-guide#buttons-use-the-default-cursor) from `cursor: pointer` to `cursor: default` for the button component.

If you want to keep the `cursor: pointer` behavior, add the following code to your CSS file:

```css showLineNumbers title="globals.css"
@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```

## Examples

### Size

Use the `size` prop to change the size of the button.

<ComponentPreview styleName="radix-nova" name="button-size" />

### Default

<ComponentPreview styleName="radix-nova" name="button-default" />

### Outline

<ComponentPreview styleName="radix-nova" name="button-outline" />

### Secondary

<ComponentPreview styleName="radix-nova" name="button-secondary" />

### Ghost

<ComponentPreview styleName="radix-nova" name="button-ghost" />

### Destructive

<ComponentPreview styleName="radix-nova" name="button-destructive" />

### Link

<ComponentPreview styleName="radix-nova" name="button-link" />

### Icon

<ComponentPreview styleName="radix-nova" name="button-icon" />

### With Icon

Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the icon for the correct spacing.

<ComponentPreview styleName="radix-nova" name="button-with-icon" />

### Rounded

Use the `rounded-full` class to make the button rounded.

<ComponentPreview styleName="radix-nova" name="button-rounded" />

### Spinner

Render a `<Spinner />` component inside the button to show a loading state. Remember to add the `data-icon="inline-start"` or `data-icon="inline-end"` attribute to the spinner for the correct spacing.

<ComponentPreview styleName="radix-nova" name="button-spinner" />

### Button Group

To create a button group, use the `ButtonGroup` component. See the [Button Group](/docs/components/radix/button-group) documentation for more details.

<ComponentPreview styleName="radix-nova" name="button-group-demo" />

### As Child

You can use the `asChild` prop on `<Button />` to make another component look like a button. Here's an example of a link that looks like a button.

<ComponentPreview styleName="radix-nova" name="button-aschild" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="button-rtl" direction="rtl" />

## API Reference

### Button

The `Button` component is a wrapper around the `button` element that adds a variety of styles and functionality.

| Prop      | Type                                                                                 | Default     |
| --------- | ------------------------------------------------------------------------------------ | ----------- |
| `variant` | `"default" \| "outline" \| "ghost" \| "destructive" \| "secondary" \| "link"`        | `"default"` |
| `size`    | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` |
| `asChild` | `boolean`                                                                            | `false`     |

## button group
---
title: Button Group
description: A container that groups related buttons together with consistent styling.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="button-group-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add button-group
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="button-group"
  title="components/ui/button-group.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"
```

```tsx
<ButtonGroup>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>
```

## Accessibility

- The `ButtonGroup` component has the `role` attribute set to `group`.
- Use <Kbd>Tab</Kbd> to navigate between the buttons in the group.
- Use `aria-label` or `aria-labelledby` to label the button group.

```tsx showLineNumbers
<ButtonGroup aria-label="Button group">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>
```

## ButtonGroup vs ToggleGroup

- Use the `ButtonGroup` component when you want to group buttons that perform an action.
- Use the `ToggleGroup` component when you want to group buttons that toggle a state.

## Examples

### Orientation

Set the `orientation` prop to change the button group layout.

<ComponentPreview styleName="radix-nova" name="button-group-orientation" />

### Size

Control the size of buttons using the `size` prop on individual buttons.

<ComponentPreview styleName="radix-nova" name="button-group-size" />

### Nested

Nest `<ButtonGroup>` components to create button groups with spacing.

<ComponentPreview styleName="radix-nova" name="button-group-nested" />

### Separator

The `ButtonGroupSeparator` component visually divides buttons within a group.

Buttons with variant `outline` do not need a separator since they have a border. For other variants, a separator is recommended to improve the visual hierarchy.

<ComponentPreview styleName="radix-nova" name="button-group-separator" />

### Split

Create a split button group by adding two buttons separated by a `ButtonGroupSeparator`.

<ComponentPreview styleName="radix-nova" name="button-group-split" />

### Input

Wrap an `Input` component with buttons.

<ComponentPreview styleName="radix-nova" name="button-group-input" />

### Input Group

Wrap an `InputGroup` component to create complex input layouts.

<ComponentPreview styleName="radix-nova" name="button-group-input-group" />

### Dropdown Menu

Create a split button group with a `DropdownMenu` component.

<ComponentPreview styleName="radix-nova" name="button-group-dropdown" />

### Select

Pair with a `Select` component.

<ComponentPreview styleName="radix-nova" name="button-group-select" />

### Popover

Use with a `Popover` component.

<ComponentPreview styleName="radix-nova" name="button-group-popover" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="button-group-rtl"
  direction="rtl"
/>

## API Reference

### ButtonGroup

The `ButtonGroup` component is a container that groups related buttons together with consistent styling.

| Prop          | Type                         | Default        |
| ------------- | ---------------------------- | -------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |

```tsx
<ButtonGroup>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>
```

Nest multiple button groups to create complex layouts with spacing. See the [nested](#nested) example for more details.

```tsx
<ButtonGroup>
  <ButtonGroup />
  <ButtonGroup />
</ButtonGroup>
```

### ButtonGroupSeparator

The `ButtonGroupSeparator` component visually divides buttons within a group.

| Prop          | Type                         | Default      |
| ------------- | ---------------------------- | ------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |

```tsx
<ButtonGroup>
  <Button>Button 1</Button>
  <ButtonGroupSeparator />
  <Button>Button 2</Button>
</ButtonGroup>
```

### ButtonGroupText

Use this component to display text within a button group.

| Prop      | Type      | Default |
| --------- | --------- | ------- |
| `asChild` | `boolean` | `false` |

```tsx
<ButtonGroup>
  <ButtonGroupText>Text</ButtonGroupText>
  <Button>Button</Button>
</ButtonGroup>
```

Use the `asChild` prop to render a custom component as the text, for example a label.

```tsx showLineNumbers
import { ButtonGroupText } from "@/components/ui/button-group"
import { Label } from "@/components/ui/label"

export function ButtonGroupTextDemo() {
  return (
    <ButtonGroup>
      <ButtonGroupText asChild>
        <Label htmlFor="name">Text</Label>
      </ButtonGroupText>
      <Input placeholder="Type something here..." id="name" />
    </ButtonGroup>
  )
}
```

## calender
---
title: Calendar
description: A calendar component that allows users to select a date or a range of dates.
base: radix
component: true
links:
  doc: https://react-day-picker.js.org
---

<ComponentPreview
  styleName="radix-nova"
  name="calendar-demo"
  previewClassName="h-96"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add calendar
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install react-day-picker date-fns
```

<Step>Add the `Button` component to your project.</Step>

The `Calendar` component uses the `Button` component. Make sure you have it installed in your project.

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="calendar"
  title="components/ui/calendar.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Calendar } from "@/components/ui/calendar"
```

```tsx showLineNumbers
const [date, setDate] = React.useState<Date | undefined>(new Date())

return (
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-lg border"
  />
)
```

See the [React DayPicker](https://react-day-picker.js.org) documentation for more information.

## About

The `Calendar` component is built on top of [React DayPicker](https://react-day-picker.js.org).

## Date Picker

You can use the `<Calendar>` component to build a date picker. See the [Date Picker](/docs/components/radix/date-picker) page for more information.

## Persian / Hijri / Jalali Calendar

To use the Persian calendar, edit `components/ui/calendar.tsx` and replace `react-day-picker` with `react-day-picker/persian`.

```diff
- import { DayPicker } from "react-day-picker"
+ import { DayPicker } from "react-day-picker/persian"
```

<ComponentPreview
  styleName="radix-nova"
  name="calendar-hijri"
  title="Persian / Hijri / Jalali Calendar"
  description="A Persian calendar."
  previewClassName="h-[400px]"
/>

## Selected Date (With TimeZone)

The Calendar component accepts a `timeZone` prop to ensure dates are displayed and selected in the user's local timezone.

```tsx showLineNumbers
export function CalendarWithTimezone() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [timeZone, setTimeZone] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      timeZone={timeZone}
    />
  )
}
```

**Note:** If you notice a selected date offset (for example, selecting the 20th highlights the 19th), make sure the `timeZone` prop is set to the user's local timezone.

**Why client-side?** The timezone is detected using `Intl.DateTimeFormat().resolvedOptions().timeZone` inside a `useEffect` to ensure compatibility with server-side rendering. Detecting the timezone during render would cause hydration mismatches, as the server and client may be in different timezones.

## Examples

### Basic

A basic calendar component. We used `className="rounded-lg border"` to style the calendar.

<ComponentPreview
  styleName="radix-nova"
  name="calendar-basic"
  previewClassName="h-96"
/>

### Range Calendar

Use the `mode="range"` prop to enable range selection.

<ComponentPreview
  styleName="radix-nova"
  name="calendar-range"
  previewClassName="h-[36rem] md:h-96"
/>

### Month and Year Selector

Use `captionLayout="dropdown"` to show month and year dropdowns.

<ComponentPreview
  styleName="radix-nova"
  name="calendar-caption"
  previewClassName="h-96"
/>

### Presets

<ComponentPreview
  styleName="radix-nova"
  name="calendar-presets"
  previewClassName="h-[650px]"
/>

### Date and Time Picker

<ComponentPreview
  styleName="radix-nova"
  name="calendar-time"
  previewClassName="h-[600px]"
/>

### Booked dates

<ComponentPreview
  styleName="radix-nova"
  name="calendar-booked-dates"
  previewClassName="h-96"
/>

### Custom Cell Size

<ComponentPreview
  styleName="radix-nova"
  name="calendar-custom-days"
  title="Custom Cell Size"
  description="A calendar with custom cell size that's responsive."
  className="**:[.preview]:h-[560px]"
/>

You can customize the size of calendar cells using the `--cell-size` CSS variable. You can also make it responsive by using breakpoint-specific values:

```tsx showLineNumbers
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
/>
```

Or use fixed values:

```tsx showLineNumbers
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-lg border [--cell-size:2.75rem] md:[--cell-size:3rem]"
/>
```

### Week Numbers

Use `showWeekNumber` to show week numbers.

<ComponentPreview
  styleName="radix-nova"
  name="calendar-week-numbers"
  previewClassName="h-96"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

See also the [Hijri Guide](#persian--hijri--jalali-calendar) for enabling the Persian / Hijri / Jalali calendar.

<ComponentPreview
  styleName="radix-nova"
  name="calendar-rtl"
  direction="rtl"
  previewClassName="h-96"
/>

When using RTL, import the locale from `react-day-picker/locale` and pass both the `locale` and `dir` props to the Calendar component:

```tsx showLineNumbers
import { arSA } from "react-day-picker/locale"

;<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  locale={arSA}
  dir="rtl"
/>
```

## API Reference

See the [React DayPicker](https://react-day-picker.js.org) documentation for more information on the `Calendar` component.

## Changelog

### RTL Support

If you're upgrading from a previous version of the `Calendar` component, you'll need to apply the following updates to add locale support:

<Steps>

<Step>Import the `Locale` type.</Step>

Add `Locale` to your imports from `react-day-picker`:

```diff
  import {
    DayPicker,
    getDefaultClassNames,
    type DayButton,
+   type Locale,
  } from "react-day-picker"
```

<Step>Add `locale` prop to the Calendar component.</Step>

Add the `locale` prop to the component's props:

```diff
  function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
+   locale,
    formatters,
    components,
    ...props
  }: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  }) {
```

<Step>Pass `locale` to DayPicker.</Step>

Pass the `locale` prop to the `DayPicker` component:

```diff
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(...)}
      captionLayout={captionLayout}
+     locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
-         date.toLocaleString("default", { month: "short" }),
+         date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
```

<Step>Update CalendarDayButton to accept locale.</Step>

Update the `CalendarDayButton` component signature and pass `locale`:

```diff
  function CalendarDayButton({
    className,
    day,
    modifiers,
+   locale,
    ...props
- }: React.ComponentProps<typeof DayButton>) {
+ }: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
```

<Step>Update date formatting in CalendarDayButton.</Step>

Use `locale?.code` in the date formatting:

```diff
    <Button
      variant="ghost"
      size="icon"
-     data-day={day.date.toLocaleDateString()}
+     data-day={day.date.toLocaleDateString(locale?.code)}
      ...
    />
```

<Step>Pass locale to DayButton component.</Step>

Update the `DayButton` component usage to pass the `locale` prop:

```diff
      components={{
        ...
-       DayButton: CalendarDayButton,
+       DayButton: ({ ...props }) => (
+         <CalendarDayButton locale={locale} {...props} />
+       ),
        ...
      }}
```

<Step>Update RTL-aware CSS classes.</Step>

Replace directional classes with logical properties for better RTL support:

```diff
  // In the day classNames:
- [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)
+ [&:last-child[data-selected=true]_button]:rounded-e-(--cell-radius)
- [&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)
+ [&:nth-child(2)[data-selected=true]_button]:rounded-s-(--cell-radius)
- [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)
+ [&:first-child[data-selected=true]_button]:rounded-s-(--cell-radius)

  // In range_start classNames:
- rounded-l-(--cell-radius) ... after:right-0
+ rounded-s-(--cell-radius) ... after:end-0

  // In range_end classNames:
- rounded-r-(--cell-radius) ... after:left-0
+ rounded-e-(--cell-radius) ... after:start-0

  // In CalendarDayButton className:
- data-[range-end=true]:rounded-r-(--cell-radius)
+ data-[range-end=true]:rounded-e-(--cell-radius)
- data-[range-start=true]:rounded-l-(--cell-radius)
+ data-[range-start=true]:rounded-s-(--cell-radius)
```

</Steps>

After applying these changes, you can use the `locale` prop to provide locale-specific formatting:

```tsx
import { enUS } from "react-day-picker/locale"

;<Calendar mode="single" selected={date} onSelect={setDate} locale={enUS} />
```

## card
---
title: Card
description: Displays a card with header, content, and footer.
base: radix
component: true
---

<ComponentPreview
  name="card-demo"
  styleName="radix-nova"
  previewClassName="h-[30rem]"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add card
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="card"
  title="components/ui/card.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
```

```tsx showLineNumbers
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

## Examples

### Size

Use the `size="sm"` prop to set the size of the card to small. The small size variant uses smaller spacing.

<ComponentPreview
  styleName="radix-nova"
  name="card-small"
  previewClassName="h-96"
/>

### Image

Add an image before the card header to create a card with an image.

<ComponentPreview
  styleName="radix-nova"
  name="card-image"
  previewClassName="h-[32rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="card-rtl"
  direction="rtl"
  previewClassName="h-[30rem]"
/>

## API Reference

### Card

The `Card` component is the root container for card content.

| Prop        | Type                | Default     |
| ----------- | ------------------- | ----------- |
| `size`      | `"default" \| "sm"` | `"default"` |
| `className` | `string`            | -           |

### CardHeader

The `CardHeader` component is used for a title, description, and optional action.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### CardTitle

The `CardTitle` component is used for the card title.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### CardDescription

The `CardDescription` component is used for helper text under the title.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### CardAction

The `CardAction` component places content in the top-right of the header (for example, a button or a badge).

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### CardContent

The `CardContent` component is used for the main card body.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

### CardFooter

The `CardFooter` component is used for actions and secondary content at the bottom of the card.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | -       |

## carousel
---
title: Carousel
description: A carousel with motion and swipe built using Embla.
base: radix
component: true
links:
  doc: https://www.embla-carousel.com/get-started/react
  api: https://www.embla-carousel.com/api
---

<ComponentPreview
  styleName="radix-nova"
  name="carousel-demo"
  previewClassName="h-80 sm:h-[32rem]"
/>

## About

The carousel component is built using the [Embla Carousel](https://www.embla-carousel.com/) library.

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>

<TabsContent value="cli">

```bash
npx shadcn@latest add carousel
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install embla-carousel-react
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="carousel"
  title="components/ui/carousel.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
```

```tsx showLineNumbers
<Carousel>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

## Examples

### Sizes

To set the size of the items, you can use the `basis` utility class on the `<CarouselItem />`.

<ComponentPreview styleName="radix-nova" name="carousel-size" />

```tsx showLineNumbers {4-6}
// 33% of the carousel width.
<Carousel>
  <CarouselContent>
    <CarouselItem className="basis-1/3">...</CarouselItem>
    <CarouselItem className="basis-1/3">...</CarouselItem>
    <CarouselItem className="basis-1/3">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

```tsx showLineNumbers {4-6}
// 50% on small screens and 33% on larger screens.
<Carousel>
  <CarouselContent>
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

### Spacing

To set the spacing between the items, we use a `pl-[VALUE]` utility on the `<CarouselItem />` and a negative `-ml-[VALUE]` on the `<CarouselContent />`.

<ComponentPreview styleName="radix-nova" name="carousel-spacing" />

```tsx showLineNumbers /-ml-4/ /pl-4/
<Carousel>
  <CarouselContent className="-ml-4">
    <CarouselItem className="pl-4">...</CarouselItem>
    <CarouselItem className="pl-4">...</CarouselItem>
    <CarouselItem className="pl-4">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

```tsx showLineNumbers /-ml-2/ /pl-2/ /md:-ml-4/ /md:pl-4/
<Carousel>
  <CarouselContent className="-ml-2 md:-ml-4">
    <CarouselItem className="pl-2 md:pl-4">...</CarouselItem>
    <CarouselItem className="pl-2 md:pl-4">...</CarouselItem>
    <CarouselItem className="pl-2 md:pl-4">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

### Orientation

Use the `orientation` prop to set the orientation of the carousel.

<ComponentPreview
  styleName="radix-nova"
  name="carousel-orientation"
  previewClassName="h-[32rem]"
/>

```tsx showLineNumbers /vertical | horizontal/
<Carousel orientation="vertical | horizontal">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
</Carousel>
```

## Options

You can pass options to the carousel using the `opts` prop. See the [Embla Carousel docs](https://www.embla-carousel.com/api/options/) for more information.

```tsx showLineNumbers {2-5}
<Carousel
  opts={{
    align: "start",
    loop: true,
  }}
>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
</Carousel>
```

## API

Use a state and the `setApi` props to get an instance of the carousel API.

<ComponentPreview
  styleName="radix-nova"
  name="carousel-api"
  previewClassName="sm:h-[32rem]"
/>

```tsx showLineNumbers {1,4,22}
import { type CarouselApi } from "@/components/ui/carousel"

export function Example() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}
```

## Events

You can listen to events using the api instance from `setApi`.

```tsx showLineNumbers {1,4-14,16}
import { type CarouselApi } from "@/components/ui/carousel"

export function Example() {
  const [api, setApi] = React.useState<CarouselApi>()

  React.useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      // Do something on select.
    })
  }, [api])

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}
```

See the [Embla Carousel docs](https://www.embla-carousel.com/api/events/) for more information on using events.

## Plugins

You can use the `plugins` prop to add plugins to the carousel.

```ts showLineNumbers {1,6-10}
import Autoplay from "embla-carousel-autoplay"

export function Example() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      // ...
    </Carousel>
  )
}
```

<ComponentPreview
  styleName="radix-nova"
  name="carousel-plugin"
  previewClassName="sm:h-[32rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="carousel-rtl"
  direction="rtl"
  previewClassName="h-80 sm:h-[32rem]"
/>

When localizing the carousel for RTL languages, you need to set the `direction` option in the `opts` prop to match the text direction. This ensures the carousel scrolls in the correct direction.

```tsx showLineNumbers {2-5}
<Carousel
  dir={dir}
  opts={{
    direction: dir,
  }}
>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious className="rtl:rotate-180" />
  <CarouselNext className="rtl:rotate-180" />
</Carousel>
```

The `direction` option accepts `"ltr"` or `"rtl"` and should match the `dir` prop value. You may also want to rotate the navigation buttons using the `rtl:rotate-180` class to ensure they point in the correct direction.

## API Reference

See the [Embla Carousel docs](https://www.embla-carousel.com/api/) for more information on props and plugins.

## chart
---
title: Chart
description: Beautiful charts. Built using Recharts. Copy and paste into your apps.
base: radix
component: true
---

<Callout>

**Note:** We're working on upgrading to Recharts v3. In the meantime, if you'd like to start testing v3, see the code in the comment [here](https://github.com/shadcn-ui/ui/issues/7669#issuecomment-2998299159). We'll have an official release soon.

</Callout>

<ComponentPreview
  styleName="radix-nova"
  name="chart-demo"
  className="theme-blue [&_.preview]:h-auto [&_.preview]:p-0 [&_.preview]:lg:min-h-[404px] [&_.preview>div]:w-full [&_.preview>div]:border-none [&_.preview>div]:shadow-none"
  hideCode
/>

Introducing **Charts**. A collection of chart components that you can copy and paste into your apps.

Charts are designed to look great out of the box. They work well with the other components and are fully customizable to fit your project.

[Browse the Charts Library](/charts).

## Component

We use [Recharts](https://recharts.org/) under the hood.

We designed the `chart` component with composition in mind. **You build your charts using Recharts components and only bring in custom components, such as `ChartTooltip`, when and where you need it**.

```tsx showLineNumbers /ChartContainer/ /ChartTooltipContent/
import { Bar, BarChart } from "recharts"

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function MyChart() {
  return (
    <ChartContainer>
      <BarChart data={data}>
        <Bar dataKey="value" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
```

We do not wrap Recharts. This means you're not locked into an abstraction. When a new Recharts version is released, you can follow the official upgrade path to upgrade your charts.

**The components are yours**.

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add chart
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install recharts
```

<Step>Copy and paste the following code into `components/ui/chart.tsx`.</Step>

<ComponentSource
  name="chart"
  title="components/ui/chart.tsx"
  styleName="radix-nova"
/>

<Step>Add the following colors to your CSS file</Step>

```css title="app/globals.css" showLineNumbers
@layer base {
  :root {
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
  }

  .dark {
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
  }
}
```

</Steps>

</TabsContent>

</CodeTabs>

## Your First Chart

Let's build your first chart. We'll build a bar chart, add a grid, axis, tooltip and legend.

<Steps>

<Step>Start by defining your data</Step>

The following data represents the number of desktop and mobile users for each month.

<Callout className="mt-4">

**Note:** Your data can be in any shape. You are not limited to the shape of the data below. Use the `dataKey` prop to map your data to the chart.

</Callout>

```tsx title="components/example-chart.tsx" showLineNumbers
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
```

<Step>Define your chart config</Step>

The chart config holds configuration for the chart. This is where you place human-readable strings, such as labels, icons and color tokens for theming.

```tsx title="components/example-chart.tsx" showLineNumbers
import { type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
```

<Step>Build your chart</Step>

You can now build your chart using Recharts components.

<Callout className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-950">

**Important:** Remember to set a `min-h-[VALUE]` on the `ChartContainer` component. This is required for the chart to be responsive.

</Callout>

<ComponentPreview
  styleName="radix-nova"
  name="chart-example"
  previewClassName="h-80"
/>

</Steps>

### Add a Grid

Let's add a grid to the chart.

<Steps className="mb-0 pt-2">

<Step>Import the `CartesianGrid` component.</Step>

```tsx /CartesianGrid/
import { Bar, BarChart, CartesianGrid } from "recharts"
```

<Step>Add the `CartesianGrid` component to your chart.</Step>

```tsx showLineNumbers {3}
<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

<ComponentPreview
  styleName="radix-nova"
  name="chart-example-grid"
  previewClassName="h-80"
/>

</Steps>

### Add an Axis

To add an x-axis to the chart, we'll use the `XAxis` component.

<Steps className="mb-0 pt-2">

<Step>Import the `XAxis` component.</Step>

```tsx /XAxis/
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
```

<Step>Add the `XAxis` component to your chart.</Step>

```tsx showLineNumbers {4-10}
<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

<ComponentPreview
  styleName="radix-nova"
  name="chart-example-axis"
  previewClassName="h-80"
/>

</Steps>

### Add Tooltip

So far we've only used components from Recharts. They look great out of the box thanks to some customization in the `chart` component.

To add a tooltip, we'll use the custom `ChartTooltip` and `ChartTooltipContent` components from `chart`.

<Steps className="mb-0 pt-2">

<Step>Import the `ChartTooltip` and `ChartTooltipContent` components.</Step>

```tsx
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
```

<Step>Add the components to your chart.</Step>

```tsx showLineNumbers {11}
<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

<ComponentPreview
  styleName="radix-nova"
  name="chart-example-tooltip"
  previewClassName="h-80"
/>

Hover to see the tooltips. Easy, right? Two components, and we've got a beautiful tooltip.

</Steps>

### Add Legend

We'll do the same for the legend. We'll use the `ChartLegend` and `ChartLegendContent` components from `chart`.

<Steps className="mb-0 pt-2">

<Step>Import the `ChartLegend` and `ChartLegendContent` components.</Step>

```tsx
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
```

<Step>Add the components to your chart.</Step>

```tsx showLineNumbers {12}
<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

<ComponentPreview
  styleName="radix-nova"
  name="chart-example-legend"
  previewClassName="h-80"
/>

</Steps>

Done. You've built your first chart! What's next?

- [Themes and Colors](/docs/components/chart#theming)
- [Tooltip](/docs/components/chart#tooltip)
- [Legend](/docs/components/chart#legend)

## Chart Config

The chart config is where you define the labels, icons and colors for a chart.

It is intentionally decoupled from chart data.

This allows you to share config and color tokens between charts. It can also work independently for cases where your data or color tokens live remotely or in a different format.

```tsx showLineNumbers /ChartConfig/
import { Monitor } from "lucide-react"

import { type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    icon: Monitor,
    // A color like 'hsl(220, 98%, 61%)' or 'var(--color-name)'
    color: "#2563eb",
    // OR a theme object with 'light' and 'dark' keys
    theme: {
      light: "#2563eb",
      dark: "#dc2626",
    },
  },
} satisfies ChartConfig
```

## Theming

Charts have built-in support for theming. You can use css variables (recommended) or color values in any color format, such as hex, hsl or oklch.

### CSS Variables

<Steps className="mb-0 pt-2">

<Step>Define your colors in your css file</Step>

```css title="app/globals.css" showLineNumbers
@layer base {
  :root {
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
  }

  .dark {
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
  }
}
```

<Step>Add the color to your `chartConfig`</Step>

```tsx title="components/example-chart.tsx" showLineNumbers
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

</Steps>

### hex, hsl or oklch

You can also define your colors directly in the chart config. Use the color format you prefer.

```tsx title="components/example-chart.tsx" showLineNumbers
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(220, 98%, 61%)",
  },
  tablet: {
    label: "Tablet",
    color: "oklch(0.5 0.2 240)",
  },
  laptop: {
    label: "Laptop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

### Using Colors

To use the theme colors in your chart, reference the colors using the format `var(--color-KEY)`.

#### Components

```tsx
<Bar dataKey="desktop" fill="var(--color-desktop)" />
```

#### Chart Data

```tsx title="components/example-chart.tsx" showLineNumbers
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]
```

#### Tailwind

```tsx title="components/example-chart.tsx"
<LabelList className="fill-[--color-desktop]" />
```

## Tooltip

A chart tooltip contains a label, name, indicator and value. You can use a combination of these to customize your tooltip.

<ComponentPreview styleName="radix-nova" name="chart-tooltip" hideCode />

You can turn on/off any of these using the `hideLabel`, `hideIndicator` props and customize the indicator style using the `indicator` prop.

Use `labelKey` and `nameKey` to use a custom key for the tooltip label and name.

Chart comes with the `<ChartTooltip>` and `<ChartTooltipContent>` components. You can use these two components to add custom tooltips to your chart.

```tsx title="components/example-chart.tsx"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
```

```tsx title="components/example-chart.tsx"
<ChartTooltip content={<ChartTooltipContent />} />
```

### Props

Use the following props to customize the tooltip.

| Prop            | Type                     | Description                                  |
| :-------------- | :----------------------- | :------------------------------------------- |
| `labelKey`      | string                   | The config or data key to use for the label. |
| `nameKey`       | string                   | The config or data key to use for the name.  |
| `indicator`     | `dot` `line` or `dashed` | The indicator style for the tooltip.         |
| `hideLabel`     | boolean                  | Whether to hide the label.                   |
| `hideIndicator` | boolean                  | Whether to hide the indicator.               |

### Colors

Colors are automatically referenced from the chart config.

### Custom

To use a custom key for tooltip label and names, use the `labelKey` and `nameKey` props.

```tsx showLineNumbers /browser/
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: {
    label: "Total Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

```tsx title="components/example-chart.tsx"
<ChartTooltip
  content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />}
/>
```

This will use `Total Visitors` for label and `Chrome` and `Safari` for the tooltip names.

## Legend

You can use the custom `<ChartLegend>` and `<ChartLegendContent>` components to add a legend to your chart.

```tsx title="components/example-chart.tsx"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
```

```tsx title="components/example-chart.tsx"
<ChartLegend content={<ChartLegendContent />} />
```

### Colors

Colors are automatically referenced from the chart config.

### Custom

To use a custom key for legend names, use the `nameKey` prop.

```tsx showLineNumbers /browser/
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

```tsx title="components/example-chart.tsx"
<ChartLegend content={<ChartLegendContent nameKey="browser" />} />
```

This will use `Chrome` and `Safari` for the legend names.

## Accessibility

You can turn on the `accessibilityLayer` prop to add an accessible layer to your chart.

This prop adds keyboard access and screen reader support to your charts.

```tsx title="components/example-chart.tsx"
<LineChart accessibilityLayer />
```

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="base-nova"
  name="chart-rtl"
  direction="rtl"
  previewClassName="h-92"
/>

## checkbox
---
title: Checkbox
description: A control that allows the user to toggle between checked and not checked.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/checkbox
  api: https://www.radix-ui.com/docs/primitives/components/checkbox#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="checkbox-demo"
  previewClassName="h-80"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add checkbox
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="checkbox"
  title="components/ui/checkbox.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Checkbox } from "@/components/ui/checkbox"
```

```tsx
<Checkbox />
```

## Checked State

Use `defaultChecked` for uncontrolled checkboxes, or `checked` and
`onCheckedChange` to control the state.

```tsx showLineNumbers
import * as React from "react"

export function Example() {
  const [checked, setChecked] = React.useState(false)

  return <Checkbox checked={checked} onCheckedChange={setChecked} />
}
```

## Invalid State

Set `aria-invalid` on the checkbox and `data-invalid` on the field wrapper to
show the invalid styles.

<ComponentPreview styleName="radix-nova" name="checkbox-invalid" />

## Examples

### Basic

Pair the checkbox with `Field` and `FieldLabel` for proper layout and labeling.

<ComponentPreview styleName="radix-nova" name="checkbox-basic" />

### Description

Use `FieldContent` and `FieldDescription` for helper text.

<ComponentPreview styleName="radix-nova" name="checkbox-description" />

### Disabled

Use the `disabled` prop to prevent interaction and add the `data-disabled` attribute to the `<Field>` component for disabled styles.

<ComponentPreview styleName="radix-nova" name="checkbox-disabled" />

### Group

Use multiple fields to create a checkbox list.

<ComponentPreview styleName="radix-nova" name="checkbox-group" />

### Table

<ComponentPreview
  styleName="radix-nova"
  name="checkbox-table"
  previewClassName="p-4 md:p-8"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="checkbox-rtl"
  direction="rtl"
  previewClassName="h-80"
/>

## API Reference

See the [Radix UI](https://www.radix-ui.com/docs/primitives/components/checkbox#api-reference) documentation for more information.

## collapsible
---
title: Collapsible
description: An interactive component which expands/collapses a panel.
base: radix
component: true
featured: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/collapsible
  api: https://www.radix-ui.com/docs/primitives/components/collapsible#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="collapsible-demo"
  align="start"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add collapsible
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="collapsible"
  title="components/ui/collapsible.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
```

```tsx showLineNumbers
<Collapsible>
  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects. No attribution
    required.
  </CollapsibleContent>
</Collapsible>
```

## Controlled State

Use the `open` and `onOpenChange` props to control the state.

```tsx showLineNumbers
import * as React from "react"

export function Example() {
  const [open, setOpen] = React.useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>
  )
}
```

## Examples

### Basic

<ComponentPreview
  styleName="radix-nova"
  name="collapsible-basic"
  align="start"
/>

### Settings Panel

Use a trigger button to reveal additional settings.

<ComponentPreview styleName="radix-nova" name="collapsible-settings" />

### File Tree

Use nested collapsibles to build a file tree.

<ComponentPreview
  styleName="radix-nova"
  name="collapsible-file-tree"
  previewClassName="h-[36rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="collapsible-rtl"
  direction="rtl"
  align="start"
/>

## API Reference

See the [Radix UI](https://www.radix-ui.com/docs/primitives/components/collapsible#api-reference) documentation for more information.

## combobox
---
title: Combobox
description: Autocomplete input with a list of suggestions.
base: radix
component: true
links:
  doc: https://base-ui.com/react/components/combobox
  api: https://base-ui.com/react/components/combobox#api-reference
---

<ComponentPreview
  styleName="base-nova"
  name="combobox-demo"
  description="A combobox with a list of frameworks."
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add combobox
```

</TabsContent>
<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install @base-ui/react
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="combobox"
  title="components/ui/combobox.tsx"
  styleName="base-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
```

```tsx showLineNumbers
const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]

export function ExampleCombobox() {
  return (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
```

## Custom Items

Use `itemToStringValue` when your items are objects.

```tsx showLineNumbers
import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

type Framework = {
  label: string
  value: string
}

const frameworks: Framework[] = [
  { label: "Next.js", value: "next" },
  { label: "SvelteKit", value: "sveltekit" },
  { label: "Nuxt", value: "nuxt" },
]

export function ExampleComboboxCustomItems() {
  return (
    <Combobox
      items={frameworks}
      itemToStringValue={(framework) => framework.label}
    >
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(framework) => (
            <ComboboxItem key={framework.value} value={framework}>
              {framework.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
```

## Multiple Selection

Use `multiple` with chips for multi-select behavior.

```tsx showLineNumbers
import * as React from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox"

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]

export function ExampleComboboxMultiple() {
  const [value, setValue] = React.useState<string[]>([])

  return (
    <Combobox
      items={frameworks}
      multiple
      value={value}
      onValueChange={setValue}
    >
      <ComboboxChips>
        <ComboboxValue>
          {value.map((item) => (
            <ComboboxChip key={item}>{item}</ComboboxChip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput placeholder="Add framework" />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
```

## Examples

### Basic

A simple combobox with a list of frameworks.

<ComponentPreview styleName="base-nova" name="combobox-basic" />

### Multiple

A combobox with multiple selection using `multiple` and `ComboboxChips`.

<ComponentPreview styleName="base-nova" name="combobox-multiple" />

### Clear Button

Use the `showClear` prop to show a clear button.

<ComponentPreview styleName="base-nova" name="combobox-clear" />

### Groups

Use `ComboboxGroup` and `ComboboxSeparator` to group items.

<ComponentPreview styleName="base-nova" name="combobox-groups" />

### Custom Items

You can render a custom component inside `ComboboxItem`.

<ComponentPreview styleName="base-nova" name="combobox-custom" />

### Invalid

Use the `aria-invalid` prop to make the combobox invalid.

<ComponentPreview styleName="base-nova" name="combobox-invalid" />

### Disabled

Use the `disabled` prop to disable the combobox.

<ComponentPreview styleName="base-nova" name="combobox-disabled" />

### Auto Highlight

Use the `autoHighlight` prop to automatically highlight the first item on filter.

<ComponentPreview styleName="base-nova" name="combobox-auto-highlight" />

### Popup

You can trigger the combobox from a button or any other component by using the `render` prop. Move the `ComboboxInput` inside the `ComboboxContent`.

<ComponentPreview styleName="base-nova" name="combobox-popup" />

### Input Group

You can add an addon to the combobox by using the `InputGroupAddon` component inside the `ComboboxInput`.

<ComponentPreview styleName="radix-nova" name="combobox-input-group" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="combobox-rtl"
  direction="rtl"
  align="start"
/>

## API Reference

See the [Base UI](https://base-ui.com/react/components/combobox#api-reference) documentation for more information.

## command
---
title: Command
description: Command menu for search and quick actions.
base: radix
component: true
links:
  doc: https://github.com/dip/cmdk
---

<ComponentPreview
  styleName="radix-nova"
  name="command-demo"
  align="start"
  previewClassName="h-[24.5rem]"
/>

## About

The `<Command />` component uses the [`cmdk`](https://github.com/dip/cmdk) component by [Dip](https://www.dip.org/).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add command
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install cmdk
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="command"
  title="components/ui/command.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
```

```tsx showLineNumbers
<Command className="max-w-sm rounded-lg border">
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Billing</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

## Examples

### Basic

A simple command menu in a dialog.

<ComponentPreview styleName="radix-nova" name="command-basic" />

### Shortcuts

<ComponentPreview styleName="radix-nova" name="command-shortcuts" />

### Groups

A command menu with groups, icons and separators.

<ComponentPreview styleName="radix-nova" name="command-groups" />

### Scrollable

Scrollable command menu with multiple items.

<ComponentPreview styleName="radix-nova" name="command-scrollable" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="command-rtl"
  direction="rtl"
  align="start"
  previewClassName="h-[24.5rem]"
/>

## API Reference

See the [cmdk](https://github.com/dip/cmdk) documentation for more information.

## context memu
---
title: Context Menu
description: Displays a menu of actions triggered by a right click.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/context-menu
  api: https://www.radix-ui.com/docs/primitives/components/context-menu#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="context-menu-demo"
  description="A context menu with sub menu items."
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add context-menu
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="context-menu"
  title="components/ui/context-menu.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
```

```tsx showLineNumbers
<ContextMenu>
  <ContextMenuTrigger>Right click here</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Profile</ContextMenuItem>
    <ContextMenuItem>Billing</ContextMenuItem>
    <ContextMenuItem>Team</ContextMenuItem>
    <ContextMenuItem>Subscription</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Examples

### Basic

A simple context menu with a few actions.

<ComponentPreview styleName="radix-nova" name="context-menu-basic" />

### Submenu

Use `ContextMenuSub` to nest secondary actions.

<ComponentPreview styleName="radix-nova" name="context-menu-submenu" />

### Shortcuts

Add `ContextMenuShortcut` to show keyboard hints.

<ComponentPreview styleName="radix-nova" name="context-menu-shortcuts" />

### Groups

Group related actions and separate them with dividers.

<ComponentPreview styleName="radix-nova" name="context-menu-groups" />

### Icons

Combine icons with labels for quick scanning.

<ComponentPreview styleName="radix-nova" name="context-menu-icons" />

### Checkboxes

Use `ContextMenuCheckboxItem` for toggles.

<ComponentPreview styleName="radix-nova" name="context-menu-checkboxes" />

### Radio

Use `ContextMenuRadioItem` for exclusive choices.

<ComponentPreview styleName="radix-nova" name="context-menu-radio" />

### Destructive

Use `variant="destructive"` to style the menu item as destructive.

<ComponentPreview styleName="radix-nova" name="context-menu-destructive" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="context-menu-rtl"
  direction="rtl"
/>

## API Reference

See the [Radix UI](https://www.radix-ui.com/docs/primitives/components/context-menu#api-reference) documentation for more information.

## data table
---
title: Data Table
description: Powerful table and datagrids built using TanStack Table.
base: base
component: true
links:
  doc: https://tanstack.com/table/v8/docs/introduction
---

<ComponentPreview
  styleName="radix-nova"
  name="data-table-demo"
  align="start"
  previewClassName="items-start h-auto px-4 md:px-8"
  hideCode
/>

## Introduction

Every data table or datagrid I've created has been unique. They all behave differently, have specific sorting and filtering requirements, and work with different data sources.

It doesn't make sense to combine all of these variations into a single component. If we do that, we'll lose the flexibility that [headless UI](https://tanstack.com/table/v8/docs/introduction#what-is-headless-ui) provides.

So instead of a data-table component, I thought it would be more helpful to provide a guide on how to build your own.

We'll start with the basic `<Table />` component and build a complex data table from scratch.

<Callout className="mt-4">

**Tip:** If you find yourself using the same table in multiple places in your app, you can always extract it into a reusable component.

</Callout>

## Table of Contents

This guide will show you how to use [TanStack Table](https://tanstack.com/table) and the `<Table />` component to build your own custom data table. We'll cover the following topics:

- [Basic Table](#basic-table)
- [Row Actions](#row-actions)
- [Pagination](#pagination)
- [Sorting](#sorting)
- [Filtering](#filtering)
- [Visibility](#visibility)
- [Row Selection](#row-selection)
- [Reusable Components](#reusable-components)

## Installation

1. Add the `<Table />` component to your project:

```bash
npx shadcn@latest add table
```

2. Add `tanstack/react-table` dependency:

```bash
npm install @tanstack/react-table
```

## Prerequisites

We are going to build a table to show recent payments. Here's what our data looks like:

```tsx showLineNumbers
type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ...
]
```

## Project Structure

Start by creating the following file structure:

```txt
app
└── payments
    ├── columns.tsx
    ├── data-table.tsx
    └── page.tsx
```

I'm using a Next.js example here but this works for any other React framework.

- `columns.tsx` (client component) will contain our column definitions.
- `data-table.tsx` (client component) will contain our `<DataTable />` component.
- `page.tsx` (server component) is where we'll fetch data and render our table.

## Basic Table

Let's start by building a basic table.

<Steps className="mb-0 pt-2">

### Column Definitions

First, we'll define our columns.

```tsx showLineNumbers title="app/payments/columns.tsx" {3,14-27}
"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]
```

<Callout className="mt-4">

**Note:** Columns are where you define the core of what your table
will look like. They define the data that will be displayed, how it will be
formatted, sorted and filtered.

</Callout>

### `<DataTable />` component

Next, we'll create a `<DataTable />` component to render our table.

```tsx showLineNumbers title="app/payments/data-table.tsx"
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

<Callout>

**Tip**: If you find yourself using `<DataTable />` in multiple places, this is the component you could make reusable by extracting it to `components/ui/data-table.tsx`.

`<DataTable columns={columns} data={data} />`

</Callout>

### Render the table

Finally, we'll render our table in our page component.

```tsx showLineNumbers title="app/payments/page.tsx" {22}
import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

</Steps>

## Cell Formatting

Let's format the amount cell to display the dollar amount. We'll also align the cell to the right.

<Steps className="mb-0 pt-2">

### Update columns definition

Update the `header` and `cell` definitions for amount as follows:

```tsx showLineNumbers title="app/payments/columns.tsx" {4-15}
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
```

You can use the same approach to format other cells and headers.

</Steps>

## Row Actions

Let's add row actions to our table. We'll use a `<DropdownMenu />` component for this.

<Steps className="mb-0 pt-2">

### Update columns definition

Update our columns definition to add a new `actions` column. The `actions` cell returns a `<DropdownMenu />` component.

```tsx showLineNumbers title="app/payments/columns.tsx" {4,6-14,18-45}
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Payment>[] = [
  // ...
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  // ...
]
```

You can access the row data using `row.original` in the `cell` function. Use this to handle actions for your row eg. use the `id` to make a DELETE call to your API.

</Steps>

## Pagination

Next, we'll add pagination to our table.

<Steps className="mb-0 pt-2">

### Update `<DataTable>`

```tsx showLineNumbers title="app/payments/data-table.tsx" {5,17}
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // ...
}
```

This will automatically paginate your rows into pages of 10. See the [pagination docs](https://tanstack.com/table/v8/docs/api/features/pagination) for more information on customizing page size and implementing manual pagination.

### Add pagination controls

We can add pagination controls to our table using the `<Button />` component and the `table.previousPage()`, `table.nextPage()` API methods.

```tsx showLineNumbers title="app/payments/data-table.tsx" {1,15,21-39}
import { Button } from "@/components/ui/button"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          { // .... }
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

See [Reusable Components](#reusable-components) section for a more advanced pagination component.

</Steps>

## Sorting

Let's make the email column sortable.

<Steps className="mb-0 pt-2">

### Update `<DataTable>`

```tsx showLineNumbers title="app/payments/data-table.tsx" {3,6,10,18,25-28}
"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>{ ... }</Table>
      </div>
    </div>
  )
}
```

### Make header cell sortable

We can now update the `email` header cell to add sorting controls.

```tsx showLineNumbers title="app/payments/columns.tsx" {4,9-19}
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]
```

This will automatically sort the table (asc and desc) when the user toggles on the header cell.

</Steps>

## Filtering

Let's add a search input to filter emails in our table.

<Steps className="mb-0 pt-2">

### Update `<DataTable>`

```tsx showLineNumbers title="app/payments/data-table.tsx" {6,10,17,24-26,35-36,39,45-54}
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>{ ... }</Table>
      </div>
    </div>
  )
}
```

Filtering is now enabled for the `email` column. You can add filters to other columns as well. See the [filtering docs](https://tanstack.com/table/v8/docs/guide/filters) for more information on customizing filters.

</Steps>

## Visibility

Adding column visibility is fairly simple using `@tanstack/react-table` visibility API.

<Steps className="mb-0 pt-2">

### Update `<DataTable>`

```tsx showLineNumbers title="app/payments/data-table.tsx" {8,18-23,33-34,45,49,64-91}
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={table.getColumn("email")?.getFilterValue() as string}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>{ ... }</Table>
      </div>
    </div>
  )
}
```

This adds a dropdown menu that you can use to toggle column visibility.

</Steps>

## Row Selection

Next, we're going to add row selection to our table.

<Steps className="mb-0 pt-2">

### Update column definitions

```tsx showLineNumbers title="app/payments/columns.tsx" {6,9-27}
"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
```

### Update `<DataTable>`

```tsx showLineNumbers title="app/payments/data-table.tsx" {11,23,28}
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table />
      </div>
    </div>
  )
}
```

This adds a checkbox to each row and a checkbox in the header to select all rows.

### Show selected rows

You can show the number of selected rows using the `table.getFilteredSelectedRowModel()` API.

```tsx
<div className="flex-1 text-sm text-muted-foreground">
  {table.getFilteredSelectedRowModel().rows.length} of{" "}
  {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```

</Steps>

## Reusable Components

Here are some components you can use to build your data tables. This is from the [Tasks](/examples/tasks) demo.

### Column header

Make any column header sortable and hideable.

<ComponentSource
  src="/app/(app)/examples/tasks/components/data-table-column-header.tsx"
  title="components/data-table-column-header.tsx"
/>

```tsx showLineNumbers {5}
export const columns = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
]
```

### Pagination

Add pagination controls to your table including page size and selection count.

<ComponentSource
  src="/app/(app)/examples/tasks/components/data-table-pagination.tsx"
  styleName="radix-nova"
/>

```tsx
<DataTablePagination table={table} />
```

### Column toggle

A component to toggle column visibility.

<ComponentSource
  src="/app/(app)/examples/tasks/components/data-table-view-options.tsx"
  styleName="radix-nova"
/>

```tsx
<DataTableViewOptions table={table} />
```

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="data-table-rtl"
  direction="rtl"
  previewClassName="items-start h-auto px-4 md:px-8"
  hideCode
/>

## data picker
---
title: Date Picker
description: A date picker component with range and presets.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="date-picker-demo" />

## Installation

The Date Picker is built using a composition of the `<Popover />` and the `<Calendar />` components.

See installation instructions for the [Popover](/docs/components/radix/popover#installation) and the [Calendar](/docs/components/radix/calendar#installation) components.

## Usage

```tsx showLineNumbers title="components/example-date-picker.tsx"
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
```

See the [React DayPicker](https://react-day-picker.js.org) documentation for more information.

## Examples

### Basic

A basic date picker component.

<ComponentPreview styleName="radix-nova" name="date-picker-basic" />

### Range Picker

A date picker component for selecting a range of dates.

<ComponentPreview styleName="radix-nova" name="date-picker-range" />

### Date of Birth

A date picker component for selecting a date of birth. This component includes a dropdown caption layout for date and month selection.

<ComponentPreview styleName="radix-nova" name="date-picker-dob" />

### Input

A date picker component with an input field for selecting a date.

<ComponentPreview styleName="radix-nova" name="date-picker-input" />

### Time Picker

A date picker component with a time input field for selecting a time.

<ComponentPreview styleName="radix-nova" name="date-picker-time" />

### Natural Language Picker

This component uses the `chrono-node` library to parse natural language dates.

<ComponentPreview styleName="radix-nova" name="date-picker-natural-language" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="date-picker-rtl"
  direction="rtl"
/>

## dialog
---
title: Dialog
description: A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.
featured: true
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/dialog
  api: https://www.radix-ui.com/docs/primitives/components/dialog#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="dialog-demo"
  description="A dialog for editing profile details."
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add dialog
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="dialog"
  title="components/ui/dialog.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
```

```tsx showLineNumbers
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Examples

### Custom Close Button

Replace the default close control with your own button.

<ComponentPreview styleName="radix-nova" name="dialog-close-button" />

### No Close Button

Use `showCloseButton={false}` to hide the close button.

<ComponentPreview styleName="radix-nova" name="dialog-no-close-button" />

### Sticky Footer

Keep actions visible while the content scrolls.

<ComponentPreview styleName="radix-nova" name="dialog-sticky-footer" />

### Scrollable Content

Long content can scroll while the header stays in view.

<ComponentPreview styleName="radix-nova" name="dialog-scrollable-content" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="dialog-rtl" direction="rtl" />

## API Reference

See the [Radix UI](https://www.radix-ui.com/docs/primitives/components/dialog#api-reference) documentation for more information.

## direction
---
title: Direction
description: A provider component that sets the text direction for your application.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/primitives/docs/utilities/direction-provider
  api: https://www.radix-ui.com/primitives/docs/utilities/direction-provider#api-reference
---

The `DirectionProvider` component is used to set the text direction (`ltr` or `rtl`) for your application. This is essential for supporting right-to-left languages like Arabic, Hebrew, and Persian.

Here's a preview of the component in RTL mode. Use the language selector to switch the language. To see more examples, look for the RTL section on components pages.

<ComponentPreview
  styleName="radix-nova"
  name="card-rtl"
  direction="rtl"
  previewClassName="h-auto"
  hideCode
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>

<TabsContent value="cli">

```bash
npx shadcn@latest add direction
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="direction"
  title="components/ui/direction.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { DirectionProvider } from "@/components/ui/direction"
```

```tsx showLineNumbers
<html dir="rtl">
  <body>
    <DirectionProvider direction="rtl">
      {/* Your app content */}
    </DirectionProvider>
  </body>
</html>
```

## useDirection

The `useDirection` hook is used to get the current direction of the application.

```tsx showLineNumbers
import { useDirection } from "@/components/ui/direction"

function MyComponent() {
  const direction = useDirection()
  return <div>Current direction: {direction}</div>
}
```

## drawer
---
title: Drawer
description: A drawer component for React.
base: radix
component: true
links:
  doc: https://vaul.emilkowal.ski/getting-started
---

<ComponentPreview styleName="radix-nova" name="drawer-demo" />

## About

Drawer is built on top of [Vaul](https://github.com/emilkowalski/vaul) by [emilkowalski](https://twitter.com/emilkowalski).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add drawer
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install vaul
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="drawer"
  title="components/ui/drawer.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
```

```tsx showLineNumbers
<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Examples

### Scrollable Content

Keep actions visible while the content scrolls.

<ComponentPreview styleName="radix-nova" name="drawer-scrollable-content" />

### Sides

Use the `direction` prop to set the side of the drawer. Available options are `top`, `right`, `bottom`, and `left`.

<ComponentPreview styleName="radix-nova" name="drawer-sides" />

### Responsive Dialog

You can combine the `Dialog` and `Drawer` components to create a responsive dialog. This renders a `Dialog` component on desktop and a `Drawer` on mobile.

<ComponentPreview styleName="radix-nova" name="drawer-dialog" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="drawer-rtl" direction="rtl" />

## API Reference

See the [Vaul documentation](https://vaul.emilkowal.ski/getting-started) for the full API reference.

## dropdown meau
---
title: Dropdown Menu
description: Displays a menu to the user — such as a set of actions or functions — triggered by a button.
featured: true
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/dropdown-menu
  api: https://www.radix-ui.com/docs/primitives/components/dropdown-menu#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="dropdown-menu-demo"
  description="A dropdown menu with icons, shortcuts and sub menu items."
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add dropdown-menu
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="dropdown-menu"
  title="components/ui/dropdown-menu.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
```

```tsx showLineNumbers
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Billing</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Team</DropdownMenuItem>
      <DropdownMenuItem>Subscription</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

## Examples

### Basic

A basic dropdown menu with labels and separators.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-basic" />

### Submenu

Use `DropdownMenuSub` to nest secondary actions.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-submenu" />

### Shortcuts

Add `DropdownMenuShortcut` to show keyboard hints.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-shortcuts" />

### Icons

Combine icons with labels for quick scanning.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-icons" />

### Checkboxes

Use `DropdownMenuCheckboxItem` for toggles.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-checkboxes" />

### Checkboxes Icons

Add icons to checkbox items.

<ComponentPreview
  styleName="radix-nova"
  name="dropdown-menu-checkboxes-icons"
/>

### Radio Group

Use `DropdownMenuRadioGroup` for exclusive choices.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-radio-group" />

### Radio Icons

Show radio options with icons.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-radio-icons" />

### Destructive

Use `variant="destructive"` for irreversible actions.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-destructive" />

### Avatar

An account switcher dropdown triggered by an avatar.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-avatar" />

### Complex

A richer example combining groups, icons, and submenus.

<ComponentPreview styleName="radix-nova" name="dropdown-menu-complex" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="dropdown-menu-rtl"
  direction="rtl"
/>

## API Reference

See the [Radix UI documentation](https://www.radix-ui.com/docs/primitives/components/dropdown-menu) for the full API reference.

## empty
---
title: Empty
description: Use the Empty component to display an empty state.
base: radix
component: true
---

<ComponentPreview
  styleName="radix-nova"
  name="empty-demo"
  previewClassName="h-96 p-0"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add empty
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="empty"
  title="components/ui/empty.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
```

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon />
    </EmptyMedia>
    <EmptyTitle>No data</EmptyTitle>
    <EmptyDescription>No data found</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add data</Button>
  </EmptyContent>
</Empty>
```

## Examples

### Outline

Use the `border` utility class to create an outline empty state.

<ComponentPreview
  styleName="radix-nova"
  name="empty-outline"
  previewClassName="h-96 p-6 md:p-10"
/>

### Background

Use the `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.

<ComponentPreview
  styleName="radix-nova"
  name="empty-background"
  previewClassName="h-96 p-0"
/>

### Avatar

Use the `EmptyMedia` component to display an avatar in the empty state.

<ComponentPreview
  styleName="radix-nova"
  name="empty-avatar"
  previewClassName="h-96 p-0"
/>

### Avatar Group

Use the `EmptyMedia` component to display an avatar group in the empty state.

<ComponentPreview
  styleName="radix-nova"
  name="empty-avatar-group"
  previewClassName="h-96 p-0"
/>

### InputGroup

You can add an `InputGroup` component to the `EmptyContent` component.

<ComponentPreview
  styleName="radix-nova"
  name="empty-input-group"
  previewClassName="h-96 p-0"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="empty-rtl" direction="rtl" />

## API Reference

### Empty

The main component of the empty state. Wraps the `EmptyHeader` and `EmptyContent` components.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<Empty>
  <EmptyHeader />
  <EmptyContent />
</Empty>
```

### EmptyHeader

The `EmptyHeader` component wraps the empty media, title, and description.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<EmptyHeader>
  <EmptyMedia />
  <EmptyTitle />
  <EmptyDescription />
</EmptyHeader>
```

### EmptyMedia

Use the `EmptyMedia` component to display the media of the empty state such as an icon or an image. You can also use it to display other components such as an avatar.

| Prop        | Type                  | Default   |
| ----------- | --------------------- | --------- |
| `variant`   | `"default" \| "icon"` | `default` |
| `className` | `string`              |           |

```tsx
<EmptyMedia variant="icon">
  <Icon />
</EmptyMedia>
```

```tsx
<EmptyMedia>
  <Avatar>
    <AvatarImage src="..." />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
</EmptyMedia>
```

### EmptyTitle

Use the `EmptyTitle` component to display the title of the empty state.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<EmptyTitle>No data</EmptyTitle>
```

### EmptyDescription

Use the `EmptyDescription` component to display the description of the empty state.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<EmptyDescription>You do not have any notifications.</EmptyDescription>
```

### EmptyContent

Use the `EmptyContent` component to display the content of the empty state such as a button, input or a link.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<EmptyContent>
  <Button>Add Project</Button>
</EmptyContent>
```

## field
---
title: Field
description: Combine labels, controls, and help text to compose accessible form fields and grouped inputs.
base: radix
component: true
---

<ComponentPreview
  styleName="radix-nova"
  name="field-demo"
  previewClassName="h-[800px] p-6 md:h-[850px]"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add field
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="field"
  title="components/ui/field.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
```

```tsx showLineNumbers
<FieldSet>
  <FieldLegend>Profile</FieldLegend>
  <FieldDescription>This appears on invoices and emails.</FieldDescription>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Full name</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" autoComplete="off" aria-invalid />
      <FieldError>Choose another username.</FieldError>
    </Field>
    <Field orientation="horizontal">
      <Switch id="newsletter" />
      <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

## Anatomy

The `Field` family is designed for composing accessible forms. A typical field is structured as follows:

```tsx showLineNumbers
<Field>
  <FieldLabel htmlFor="input-id">Label</FieldLabel>
  {/* Input, Select, Switch, etc. */}
  <FieldDescription>Optional helper text.</FieldDescription>
  <FieldError>Validation message.</FieldError>
</Field>
```

- `Field` is the core wrapper for a single field.
- `FieldContent` is a flex column that groups label and description. Not required if you have no description.
- Wrap related fields with `FieldGroup`, and use `FieldSet` with `FieldLegend` for semantic grouping.

## Form

See the [Form](/docs/forms) documentation for building forms with the `Field` component and [React Hook Form](/docs/forms/react-hook-form) or [Tanstack Form](/docs/forms/tanstack-form).

## Examples

### Input

<ComponentPreview styleName="radix-nova" name="field-input" />

### Textarea

<ComponentPreview styleName="radix-nova" name="field-textarea" />

### Select

<ComponentPreview styleName="radix-nova" name="field-select" />

### Slider

<ComponentPreview styleName="radix-nova" name="field-slider" />

### Fieldset

<ComponentPreview styleName="radix-nova" name="field-fieldset" />

### Checkbox

<ComponentPreview
  styleName="radix-nova"
  name="field-checkbox"
  previewClassName="h-[32rem]"
/>

### Radio

<ComponentPreview styleName="radix-nova" name="field-radio" />

### Switch

<ComponentPreview styleName="radix-nova" name="field-switch" />

### Choice Card

Wrap `Field` components inside `FieldLabel` to create selectable field groups. This works with `RadioItem`, `Checkbox` and `Switch` components.

<ComponentPreview styleName="radix-nova" name="field-choice-card" />

### Field Group

Stack `Field` components with `FieldGroup`. Add `FieldSeparator` to divide them.

<ComponentPreview
  styleName="radix-nova"
  name="field-group"
  previewClassName="h-96"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="field-rtl"
  direction="rtl"
  previewClassName="h-auto p-6"
/>

## Responsive Layout

- **Vertical fields:** Default orientation stacks label, control, and helper text—ideal for mobile-first layouts.
- **Horizontal fields:** Set `orientation="horizontal"` on `Field` to align the label and control side-by-side. Pair with `FieldContent` to keep descriptions aligned.
- **Responsive fields:** Set `orientation="responsive"` for automatic column layouts inside container-aware parents. Apply `@container/field-group` classes on `FieldGroup` to switch orientations at specific breakpoints.

<ComponentPreview
  styleName="radix-nova"
  name="field-responsive"
  previewClassName="h-[650px] p-6 md:h-[500px] md:p-10"
/>

## Validation and Errors

- Add `data-invalid` to `Field` to switch the entire block into an error state.
- Add `aria-invalid` on the input itself for assistive technologies.
- Render `FieldError` immediately after the control or inside `FieldContent` to keep error messages aligned with the field.

```tsx showLineNumbers /data-invalid/ /aria-invalid/
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" aria-invalid />
  <FieldError>Enter a valid email address.</FieldError>
</Field>
```

## Accessibility

- `FieldSet` and `FieldLegend` keep related controls grouped for keyboard and assistive tech users.
- `Field` outputs `role="group"` so nested controls inherit labeling from `FieldLabel` and `FieldLegend` when combined.
- Apply `FieldSeparator` sparingly to ensure screen readers encounter clear section boundaries.

## API Reference

### FieldSet

Container that renders a semantic `fieldset` with spacing presets.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldSet>
  <FieldLegend>Delivery</FieldLegend>
  <FieldGroup>{/* Fields */}</FieldGroup>
</FieldSet>
```

### FieldLegend

Legend element for a `FieldSet`. Switch to the `label` variant to align with label sizing.

| Prop        | Type                  | Default    |
| ----------- | --------------------- | ---------- |
| `variant`   | `"legend" \| "label"` | `"legend"` |
| `className` | `string`              |            |

```tsx
<FieldLegend variant="label">Notification Preferences</FieldLegend>
```

The `FieldLegend` has two variants: `legend` and `label`. The `label` variant applies label sizing and alignment. Handy if you have nested `FieldSet`.

### FieldGroup

Layout wrapper that stacks `Field` components and enables container queries for responsive orientations.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldGroup className="@container/field-group flex flex-col gap-6">
  <Field>{/* ... */}</Field>
  <Field>{/* ... */}</Field>
</FieldGroup>
```

### Field

The core wrapper for a single field. Provides orientation control, invalid state styling, and spacing.

| Prop           | Type                                         | Default      |
| -------------- | -------------------------------------------- | ------------ |
| `orientation`  | `"vertical" \| "horizontal" \| "responsive"` | `"vertical"` |
| `className`    | `string`                                     |              |
| `data-invalid` | `boolean`                                    |              |

```tsx
<Field orientation="horizontal">
  <FieldLabel htmlFor="remember">Remember me</FieldLabel>
  <Switch id="remember" />
</Field>
```

### FieldContent

Flex column that groups control and descriptions when the label sits beside the control. Not required if you have no description.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<Field>
  <Checkbox id="notifications" />
  <FieldContent>
    <FieldLabel htmlFor="notifications">Notifications</FieldLabel>
    <FieldDescription>Email, SMS, and push options.</FieldDescription>
  </FieldContent>
</Field>
```

### FieldLabel

Label styled for both direct inputs and nested `Field` children.

| Prop        | Type      | Default |
| ----------- | --------- | ------- |
| `className` | `string`  |         |
| `asChild`   | `boolean` | `false` |

```tsx
<FieldLabel htmlFor="email">Email</FieldLabel>
```

### FieldTitle

Renders a title with label styling inside `FieldContent`.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldContent>
  <FieldTitle>Enable Touch ID</FieldTitle>
  <FieldDescription>Unlock your device faster.</FieldDescription>
</FieldContent>
```

### FieldDescription

Helper text slot that automatically balances long lines in horizontal layouts.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldDescription>We never share your email with anyone.</FieldDescription>
```

### FieldSeparator

Visual divider to separate sections inside a `FieldGroup`. Accepts optional inline content.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<FieldSeparator>Or continue with</FieldSeparator>
```

### FieldError

Accessible error container that accepts children or an `errors` array (e.g., from `react-hook-form`).

| Prop        | Type                                       | Default |
| ----------- | ------------------------------------------ | ------- |
| `errors`    | `Array<{ message?: string } \| undefined>` |         |
| `className` | `string`                                   |         |

```tsx
<FieldError errors={errors.username} />
```

When the `errors` array contains multiple messages, the component renders a list automatically.

`FieldError` also accepts issues produced by any validator that implements [Standard Schema](https://standardschema.dev/), including Zod, Valibot, and ArkType. Pass the `issues` array from the schema result directly to render a unified error list across libraries.

## hover card
---
title: Hover Card
description: For sighted users to preview content available behind a link.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/hover-card
  api: https://www.radix-ui.com/docs/primitives/components/hover-card#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="hover-card-demo"
  previewClassName="h-80"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add hover-card
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="hover-card"
  title="components/ui/hover-card.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
```

```tsx showLineNumbers
<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>
    The React Framework – created and maintained by @vercel.
  </HoverCardContent>
</HoverCard>
```

## Trigger Delays

Use `openDelay` and `closeDelay` on the `HoverCard` to control when the card opens and
closes.

```tsx showLineNumbers
<HoverCard openDelay={100} closeDelay={200}>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>Content</HoverCardContent>
</HoverCard>
```

## Positioning

Use the `side` and `align` props on `HoverCardContent` to control placement.

```tsx showLineNumbers
<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent side="top" align="start">
    Content
  </HoverCardContent>
</HoverCard>
```

## Examples

### Basic

<ComponentPreview
  styleName="radix-nova"
  name="hover-card-demo"
  previewClassName="h-80"
/>

### Sides

<ComponentPreview
  styleName="radix-nova"
  name="hover-card-sides"
  previewClassName="h-[22rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="hover-card-rtl"
  direction="rtl"
  previewClassName="h-80"
/>

## API Reference

See the [Radix UI](https://www.radix-ui.com/docs/primitives/components/hover-card#api-reference) documentation for more information.

## input
---
title: Input
description: A text input component for forms and user data entry with built-in styling and accessibility features.
base: radix
component: true
---

<ComponentPreview
  styleName="radix-nova"
  name="input-demo"
  previewClassName="*:max-w-xs"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add input
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="input"
  title="components/ui/input.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Input } from "@/components/ui/input"
```

```tsx
<Input />
```

## Examples

### Basic

<ComponentPreview
  styleName="radix-nova"
  name="input-basic"
  previewClassName="*:max-w-xs"
/>

### Field

Use `Field`, `FieldLabel`, and `FieldDescription` to create an input with a
label and description.

<ComponentPreview
  styleName="radix-nova"
  name="input-field"
  previewClassName="*:max-w-xs"
/>

### Field Group

Use `FieldGroup` to show multiple `Field` blocks and to build forms.

<ComponentPreview
  styleName="radix-nova"
  name="input-fieldgroup"
  previewClassName="*:max-w-xs"
/>

### Disabled

Use the `disabled` prop to disable the input. To style the disabled state, add the `data-disabled` attribute to the `Field` component.

<ComponentPreview
  styleName="radix-nova"
  name="input-disabled"
  previewClassName="*:max-w-xs"
/>

### Invalid

Use the `aria-invalid` prop to mark the input as invalid. To style the invalid state, add the `data-invalid` attribute to the `Field` component.

<ComponentPreview
  styleName="radix-nova"
  name="input-invalid"
  previewClassName="*:max-w-xs"
/>

### File

Use the `type="file"` prop to create a file input.

<ComponentPreview
  styleName="radix-nova"
  name="input-file"
  previewClassName="*:max-w-xs"
/>

### Inline

Use `Field` with `orientation="horizontal"` to create an inline input.
Pair with `Button` to create a search input with a button.

<ComponentPreview
  styleName="radix-nova"
  name="input-inline"
  previewClassName="*:max-w-xs"
/>

### Grid

Use a grid layout to place multiple inputs side by side.

<ComponentPreview
  styleName="radix-nova"
  name="input-grid"
  previewClassName="p-6"
/>

### Required

Use the `required` attribute to indicate required inputs.

<ComponentPreview
  styleName="radix-nova"
  name="input-required"
  previewClassName="*:max-w-xs"
/>

### Badge

Use `Badge` in the label to highlight a recommended field.

<ComponentPreview
  styleName="radix-nova"
  name="input-badge"
  previewClassName="*:max-w-xs"
/>

### Input Group

To add icons, text, or buttons inside an input, use the `InputGroup` component. See the [Input Group](/docs/components/input-group) component for more examples.

<ComponentPreview
  styleName="radix-nova"
  name="input-input-group"
  previewClassName="*:max-w-xs"
/>

### Button Group

To add buttons to an input, use the `ButtonGroup` component. See the [Button Group](/docs/components/button-group) component for more examples.

<ComponentPreview
  styleName="radix-nova"
  name="input-button-group"
  previewClassName="*:max-w-xs"
/>

### Form

A full form example with multiple inputs, a select, and a button.

<ComponentPreview
  styleName="radix-nova"
  name="input-form"
  previewClassName="h-[32rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="input-rtl"
  direction="rtl"
  previewClassName="*:max-w-xs"
/>

## input group
---
title: Input Group
description: Add addons, buttons, and helper content to inputs.
base: radix
component: true
---

import { IconInfoCircle } from "@tabler/icons-react"

<ComponentPreview
  styleName="radix-nova"
  name="input-group-demo"
  previewClassName="h-[26rem]"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add input-group
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="input-group"
  title="components/ui/input-group.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
```

```tsx showLineNumbers
<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
</InputGroup>
```

## Align

Use the `align` prop on `InputGroupAddon` to position the addon relative to the input.

<Callout>
  For proper focus management, `InputGroupAddon` should always be placed after
  `InputGroupInput` or `InputGroupTextarea` in the DOM. Use the `align` prop to
  visually position the addon.
</Callout>

### inline-start

Use `align="inline-start"` to position the addon at the start of the input. This is the default.

<ComponentPreview
  styleName="radix-nova"
  name="input-group-inline-start"
  previewClassName="h-48"
/>

### inline-end

Use `align="inline-end"` to position the addon at the end of the input.

<ComponentPreview
  styleName="radix-nova"
  name="input-group-inline-end"
  previewClassName="h-48"
/>

### block-start

Use `align="block-start"` to position the addon above the input.

<ComponentPreview
  styleName="radix-nova"
  name="input-group-block-start"
  previewClassName="h-96"
/>

### block-end

Use `align="block-end"` to position the addon below the input.

<ComponentPreview
  styleName="radix-nova"
  name="input-group-block-end"
  previewClassName="h-[26rem]"
/>

## Examples

### Icon

<ComponentPreview
  styleName="radix-nova"
  name="input-group-icon"
  previewClassName="h-80"
/>

### Text

<ComponentPreview
  styleName="radix-nova"
  name="input-group-text"
  previewClassName="h-80"
/>

### Button

<ComponentPreview
  styleName="radix-nova"
  name="input-group-button"
  previewClassName="h-72"
/>

### Kbd

<ComponentPreview
  styleName="radix-nova"
  name="input-group-kbd"
  previewClassName="h-40"
/>

### Dropdown

<ComponentPreview
  styleName="radix-nova"
  name="input-group-dropdown"
  previewClassName="h-56"
/>

### Spinner

<ComponentPreview
  styleName="radix-nova"
  name="input-group-spinner"
  previewClassName="h-80"
/>

### Textarea

<ComponentPreview
  styleName="radix-nova"
  name="input-group-textarea"
  previewClassName="h-96"
/>

### Custom Input

Add the `data-slot="input-group-control"` attribute to your custom input for automatic focus state handling.

Here's an example of a custom resizable textarea from a third-party library.

<ComponentPreview
  styleName="radix-nova"
  name="input-group-custom"
  previewClassName="h-56"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="input-group-rtl"
  direction="rtl"
  previewClassName="h-[30rem]"
/>

## API Reference

### InputGroup

The main component that wraps inputs and addons.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

```tsx
<InputGroup>
  <InputGroupInput />
  <InputGroupAddon />
</InputGroup>
```

### InputGroupAddon

Displays icons, text, buttons, or other content alongside inputs.

<Callout icon={<IconInfoCircle />} title="Focus Navigation">
  For proper focus navigation, the `InputGroupAddon` component should be placed
  after the input. Set the `align` prop to position the addon.
</Callout>

| Prop        | Type                                                             | Default          |
| ----------- | ---------------------------------------------------------------- | ---------------- |
| `align`     | `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` | `"inline-start"` |
| `className` | `string`                                                         |                  |

```tsx
<InputGroupAddon align="inline-end">
  <SearchIcon />
</InputGroupAddon>
```

**For `<InputGroupInput />`, use the `inline-start` or `inline-end` alignment. For `<InputGroupTextarea />`, use the `block-start` or `block-end` alignment.**

The `InputGroupAddon` component can have multiple `InputGroupButton` components and icons.

```tsx
<InputGroupAddon>
  <InputGroupButton>Button</InputGroupButton>
  <InputGroupButton>Button</InputGroupButton>
</InputGroupAddon>
```

### InputGroupButton

Displays buttons within input groups.

| Prop        | Type                                                                          | Default   |
| ----------- | ----------------------------------------------------------------------------- | --------- |
| `size`      | `"xs" \| "icon-xs" \| "sm" \| "icon-sm"`                                      | `"xs"`    |
| `variant`   | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"ghost"` |
| `className` | `string`                                                                      |           |

```tsx
<InputGroupButton>Button</InputGroupButton>
<InputGroupButton size="icon-xs" aria-label="Copy">
  <CopyIcon />
</InputGroupButton>
```

### InputGroupInput

Replacement for `<Input />` when building input groups. This component has the input group styles pre-applied and uses the unified `data-slot="input-group-control"` for focus state handling.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

All other props are passed through to the underlying `<Input />` component.

```tsx
<InputGroup>
  <InputGroupInput placeholder="Enter text..." />
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
</InputGroup>
```

### InputGroupTextarea

Replacement for `<Textarea />` when building input groups. This component has the textarea group styles pre-applied and uses the unified `data-slot="input-group-control"` for focus state handling.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` |         |

All other props are passed through to the underlying `<Textarea />` component.

```tsx
<InputGroup>
  <InputGroupTextarea placeholder="Enter message..." />
  <InputGroupAddon align="block-end">
    <InputGroupButton>Send</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

## Changelog

### 2025-10-06 `InputGroup`

Add the `min-w-0` class to the `InputGroup` component. See [diff](https://github.com/shadcn-ui/ui/pull/8341/files#diff-0e2ee95d0050ca4c5d82339df86c54e14a6739dc4638fdda0eec8f73aebc2da9).

## input otp
---
title: Input OTP
description: Accessible one-time password component with copy-paste functionality.
base: radix
component: true
links:
  doc: https://input-otp.rodz.dev
---

<ComponentPreview styleName="radix-nova" name="input-otp-demo" />

## About

Input OTP is built on top of [input-otp](https://github.com/guilhermerodz/input-otp) by [@guilherme_rodz](https://twitter.com/guilherme_rodz).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add input-otp
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install input-otp
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="input-otp"
  title="components/ui/input-otp.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
```

```tsx showLineNumbers
<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

## Pattern

Use the `pattern` prop to define a custom pattern for the OTP input.

```tsx showLineNumbers {1,5}
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

;<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
  ...
</InputOTP>
```

<ComponentPreview styleName="radix-nova" name="input-otp-pattern" />

## Examples

### Separator

Use the `<InputOTPSeparator />` component to add a separator between input groups.

<ComponentPreview styleName="radix-nova" name="input-otp-separator" />

### Disabled

Use the `disabled` prop to disable the input.

<ComponentPreview styleName="radix-nova" name="input-otp-disabled" />

### Controlled

Use the `value` and `onChange` props to control the input value.

<ComponentPreview styleName="radix-nova" name="input-otp-controlled" />

### Invalid

Use `aria-invalid` on the slots to show an error state.

<ComponentPreview styleName="radix-nova" name="input-otp-invalid" />

### Four Digits

A common pattern for PIN codes. This uses the `pattern={REGEXP_ONLY_DIGITS}` prop.

<ComponentPreview styleName="radix-nova" name="input-otp-four-digits" />

### Alphanumeric

Use `REGEXP_ONLY_DIGITS_AND_CHARS` to accept both letters and numbers.

<ComponentPreview styleName="radix-nova" name="input-otp-alphanumeric" />

### Form

<ComponentPreview
  styleName="radix-nova"
  name="input-otp-form"
  previewClassName="h-[30rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="input-otp-rtl" direction="rtl" />

## API Reference

See the [input-otp](https://input-otp.rodz.dev) documentation for more information.

## item
---
title: Item
description: A versatile component for displaying content with media, title, description, and actions.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="item-demo" />

The `Item` component is a straightforward flex container that can house nearly any type of content. Use it to display a title, description, and actions. Group it with the `ItemGroup` component to create a list of items.

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add item
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="item"
  title="components/ui/item.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
```

```tsx showLineNumbers
<Item>
  <ItemMedia variant="icon">
    <Icon />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Title</ItemTitle>
    <ItemDescription>Description</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button>Action</Button>
  </ItemActions>
</Item>
```

## Item vs Field

Use `Field` if you need to display a form input such as a checkbox, input, radio, or select.

If you only need to display content such as a title, description, and actions, use `Item`.

## Variant

Use the `variant` prop to change the visual style of the item.

<ComponentPreview
  styleName="radix-nova"
  name="item-variant"
  previewClassName="h-96"
/>

## Size

Use the `size` prop to change the size of the item. Available sizes are `default`, `sm`, and `xs`.

<ComponentPreview
  styleName="radix-nova"
  name="item-size"
  previewClassName="h-96"
/>

## Examples

### Icon

Use `ItemMedia` with `variant="icon"` to display an icon.

<ComponentPreview styleName="radix-nova" name="item-icon" />

### Avatar

You can use `ItemMedia` with `variant="avatar"` to display an avatar.

<ComponentPreview styleName="radix-nova" name="item-avatar" />

### Image

Use `ItemMedia` with `variant="image"` to display an image.

<ComponentPreview styleName="radix-nova" name="item-image" />

### Group

Use `ItemGroup` to group related items together.

<ComponentPreview
  styleName="radix-nova"
  name="item-group"
  previewClassName="h-96"
/>

### Header

Use `ItemHeader` to add a header above the item content.

<ComponentPreview
  styleName="radix-nova"
  name="item-header"
  previewClassName="h-96"
/>

### Link

Use the `asChild` prop to render the item as a link. The hover and focus states will be applied to the anchor element.

<ComponentPreview styleName="radix-nova" name="item-link" />

```tsx showLineNumbers
<Item asChild>
  <a href="/dashboard">
    <ItemMedia variant="icon">
      <HomeIcon />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Dashboard</ItemTitle>
      <ItemDescription>Overview of your account and activity.</ItemDescription>
    </ItemContent>
  </a>
</Item>
```

### Dropdown

<ComponentPreview styleName="radix-nova" name="item-dropdown" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="item-rtl" direction="rtl" />

## API Reference

### Item

The main component for displaying content with media, title, description, and actions.

| Prop      | Type                                | Default     |
| --------- | ----------------------------------- | ----------- |
| `variant` | `"default" \| "outline" \| "muted"` | `"default"` |
| `size`    | `"default" \| "sm" \| "xs"`         | `"default"` |
| `asChild` | `boolean`                           | `false`     |

### ItemGroup

A container that groups related items together with consistent styling.

```tsx
<ItemGroup>
  <Item />
  <Item />
</ItemGroup>
```

### ItemSeparator

A separator between items in a group.

```tsx
<ItemGroup>
  <Item />
  <ItemSeparator />
  <Item />
</ItemGroup>
```

### ItemMedia

Use `ItemMedia` to display media content such as icons, images, or avatars.

| Prop      | Type                             | Default     |
| --------- | -------------------------------- | ----------- |
| `variant` | `"default" \| "icon" \| "image"` | `"default"` |

```tsx
<ItemMedia variant="icon">
  <Icon />
</ItemMedia>
```

```tsx
<ItemMedia variant="image">
  <img src="..." alt="..." />
</ItemMedia>
```

### ItemContent

Wraps the title and description of the item.

```tsx
<ItemContent>
  <ItemTitle>Title</ItemTitle>
  <ItemDescription>Description</ItemDescription>
</ItemContent>
```

### ItemTitle

Displays the title of the item.

```tsx
<ItemTitle>Item Title</ItemTitle>
```

### ItemDescription

Displays the description of the item.

```tsx
<ItemDescription>Item description</ItemDescription>
```

### ItemActions

Container for action buttons or other interactive elements.

```tsx
<ItemActions>
  <Button>Action</Button>
</ItemActions>
```

### ItemHeader

Displays a header above the item content.

```tsx
<Item>
  <ItemHeader>Header</ItemHeader>
  <ItemContent>...</ItemContent>
</Item>
```

### ItemFooter

Displays a footer below the item content.

```tsx
<Item>
  <ItemContent>...</ItemContent>
  <ItemFooter>Footer</ItemFooter>
</Item>
```

## kbd
---
title: Kbd
description: Used to display textual user input from keyboard.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="kbd-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add kbd
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="kbd"
  title="components/ui/kbd.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Kbd } from "@/components/ui/kbd"
```

```tsx
<Kbd>Ctrl</Kbd>
```

## Examples

### Group

Use the `KbdGroup` component to group keyboard keys together.

<ComponentPreview styleName="radix-nova" name="kbd-group" />

### Button

Use the `Kbd` component inside a `Button` component to display a keyboard key inside a button.

<ComponentPreview styleName="radix-nova" name="kbd-button" />

### Tooltip

You can use the `Kbd` component inside a `Tooltip` component to display a tooltip with a keyboard key.

<ComponentPreview styleName="radix-nova" name="kbd-tooltip" />

### Input Group

You can use the `Kbd` component inside a `InputGroupAddon` component to display a keyboard key inside an input group.

<ComponentPreview styleName="radix-nova" name="kbd-input-group" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="kbd-rtl" direction="rtl" />

## API Reference

### Kbd

Use the `Kbd` component to display a keyboard key.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | ``      |

```tsx
<Kbd>Ctrl</Kbd>
```

### KbdGroup

Use the `KbdGroup` component to group `Kbd` components together.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `className` | `string` | ``      |

```tsx
<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <Kbd>B</Kbd>
</KbdGroup>
```

## label
---
title: Label
description: Renders an accessible label associated with controls.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/label
  api: https://www.radix-ui.com/docs/primitives/components/label#api-reference
---

<ComponentPreview styleName="radix-nova" name="label-demo" />

<Callout>
  For form fields, use the [Field](/docs/components/radix/field) component which
  includes built-in label, description, and error handling.
</Callout>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add label
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="label"
  title="components/ui/label.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Label } from "@/components/ui/label"
```

```tsx
<Label htmlFor="email">Your email address</Label>
```

## Label in Field

For form fields, use the [Field](/docs/components/radix/field) component which
includes built-in `FieldLabel`, `FieldDescription`, and `FieldError` components.

```tsx
<Field>
  <FieldLabel htmlFor="email">Your email address</FieldLabel>
  <Input id="email" />
</Field>
```

<ComponentPreview
  styleName="radix-nova"
  name="field-demo"
  previewClassName="h-[44rem]"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="label-rtl" direction="rtl" />

## API Reference

See the [Radix UI Label](https://www.radix-ui.com/docs/primitives/components/label#api-reference) documentation for more information.

## memubar
---
title: Menubar
description: A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/menubar
  api: https://www.radix-ui.com/docs/primitives/components/menubar#api-reference
---

<ComponentPreview styleName="radix-nova" name="menubar-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add menubar
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="menubar"
  title="components/ui/menubar.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
```

```tsx showLineNumbers
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarGroup>
        <MenubarItem>
          New Tab <MenubarShortcut>⌘T</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>New Window</MenubarItem>
      </MenubarGroup>
      <MenubarSeparator />
      <MenubarGroup>
        <MenubarItem>Share</MenubarItem>
        <MenubarItem>Print</MenubarItem>
      </MenubarGroup>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Examples

### Checkbox

Use `MenubarCheckboxItem` for toggleable options.

<ComponentPreview styleName="radix-nova" name="menubar-checkbox" />

### Radio

Use `MenubarRadioGroup` and `MenubarRadioItem` for single-select options.

<ComponentPreview styleName="radix-nova" name="menubar-radio" />

### Submenu

Use `MenubarSub`, `MenubarSubTrigger`, and `MenubarSubContent` for nested menus.

<ComponentPreview styleName="radix-nova" name="menubar-submenu" />

### With Icons

<ComponentPreview styleName="radix-nova" name="menubar-icons" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="menubar-rtl" direction="rtl" />

## API Reference

See the [Radix UI Menubar](https://www.radix-ui.com/docs/primitives/components/menubar#api-reference) documentation.

## native select
---
title: Native Select
description: A styled native HTML select element with consistent design system integration.
base: radix
component: true
---

import { InfoIcon } from "lucide-react"

<Callout variant="info" icon={<InfoIcon className="translate-y-[3px]!" />}>
  For a styled select component, see the [Select](/docs/components/select)
  component.
</Callout>

<ComponentPreview styleName="radix-nova" name="native-select-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add native-select
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="native-select"
  title="components/ui/native-select.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
```

```tsx showLineNumbers
<NativeSelect>
  <NativeSelectOption value="">Select a fruit</NativeSelectOption>
  <NativeSelectOption value="apple">Apple</NativeSelectOption>
  <NativeSelectOption value="banana">Banana</NativeSelectOption>
  <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
  <NativeSelectOption value="pineapple">Pineapple</NativeSelectOption>
</NativeSelect>
```

## Examples

### Groups

Use `NativeSelectOptGroup` to organize options into categories.

<ComponentPreview styleName="radix-nova" name="native-select-groups" />

### Disabled

Add the `disabled` prop to the `NativeSelect` component to disable the select.

<ComponentPreview styleName="radix-nova" name="native-select-disabled" />

### Invalid

Use `aria-invalid` to show validation errors and the `data-invalid` attribute to the `Field` component for styling.

<ComponentPreview styleName="radix-nova" name="native-select-invalid" />

## Native Select vs Select

- Use `NativeSelect` for native browser behavior, better performance, or mobile-optimized dropdowns.
- Use `Select` for custom styling, animations, or complex interactions.

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="native-select-rtl"
  direction="rtl"
/>

## API Reference

### NativeSelect

The main select component that wraps the native HTML select element.

```tsx
<NativeSelect>
  <NativeSelectOption value="option1">Option 1</NativeSelectOption>
  <NativeSelectOption value="option2">Option 2</NativeSelectOption>
</NativeSelect>
```

### NativeSelectOption

Represents an individual option within the select.

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  |         |
| `disabled` | `boolean` | `false` |

### NativeSelectOptGroup

Groups related options together for better organization.

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `label`    | `string`  |         |
| `disabled` | `boolean` | `false` |

```tsx
<NativeSelectOptGroup label="Fruits">
  <NativeSelectOption value="apple">Apple</NativeSelectOption>
  <NativeSelectOption value="banana">Banana</NativeSelectOption>
</NativeSelectOptGroup>
```

## navigation memu
---
title: Navigation Menu
description: A collection of links for navigating websites.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/navigation-menu
  api: https://www.radix-ui.com/docs/primitives/components/navigation-menu#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="navigation-menu-demo"
  previewClassName="h-96"
  className="overflow-visible"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add navigation-menu
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="navigation-menu"
  title="components/ui/navigation-menu.tsx"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
```

```tsx showLineNumbers
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Link Component

Use the `asChild` prop to compose a custom link component such as Next.js `Link`.

```tsx showLineNumbers
import Link from "next/link"

import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function NavigationMenuDemo() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href="/docs">Documentation</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}
```

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="navigation-menu-rtl"
  direction="rtl"
  previewClassName="h-96"
  className="overflow-visible"
/>

## API Reference

See the [Radix UI Navigation Menu](https://www.radix-ui.com/docs/primitives/components/navigation-menu#api-reference) documentation for more information.

## pagination
---
title: Pagination
description: Pagination with page navigation, next and previous links.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="pagination-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add pagination
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="pagination"
  title="components/ui/pagination.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
```

```tsx showLineNumbers
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## Examples

### Simple

A simple pagination with only page numbers.

<ComponentPreview styleName="radix-nova" name="pagination-simple" />

### Icons Only

Use just the previous and next buttons without page numbers. This is useful for data tables with a rows per page selector.

<ComponentPreview styleName="radix-nova" name="pagination-icons-only" />

## Next.js

By default the `<PaginationLink />` component will render an `<a />` tag.

To use the Next.js `<Link />` component, make the following updates to `pagination.tsx`.

```diff showLineNumbers /typeof Link/ {1}
+ import Link from "next/link"

- type PaginationLinkProps = ... & React.ComponentProps<"a">
+ type PaginationLinkProps = ... & React.ComponentProps<typeof Link>

const PaginationLink = ({...props }: ) => (
  <PaginationItem>
-   <a>
+   <Link>
      // ...
-   </a>
+   </Link>
  </PaginationItem>
)

```

<Callout className="mt-6">

**Note:** We are making updates to the cli to automatically do this for you.

</Callout>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="pagination-rtl"
  direction="rtl"
/>

## Changelog

### RTL Support

If you're upgrading from a previous version of the `Pagination` component, you'll need to apply the following updates to add the `text` prop:

<Steps>

<Step>Update `PaginationPrevious`.</Step>

```diff
  function PaginationPrevious({
    className,
+   text = "Previous",
    ...props
- }: React.ComponentProps<typeof PaginationLink>) {
+ }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
      <PaginationLink
        aria-label="Go to previous page"
        size="default"
        className={cn("cn-pagination-previous", className)}
        {...props}
      >
        <ChevronLeftIcon />
        <span className="cn-pagination-previous-text hidden sm:block">
-         Previous
+         {text}
        </span>
      </PaginationLink>
    )
  }
```

<Step>Update `PaginationNext`.</Step>

```diff
  function PaginationNext({
    className,
+   text = "Next",
    ...props
- }: React.ComponentProps<typeof PaginationLink>) {
+ }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
      <PaginationLink
        aria-label="Go to next page"
        size="default"
        className={cn("cn-pagination-next", className)}
        {...props}
      >
-       <span className="cn-pagination-next-text hidden sm:block">Next</span>
+       <span className="cn-pagination-next-text hidden sm:block">{text}</span>
        <ChevronRightIcon />
      </PaginationLink>
    )
  }
```

</Steps>

## popover
---
title: Popover
description: Displays rich content in a portal, triggered by a button.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/popover
  api: https://www.radix-ui.com/docs/primitives/components/popover#api-reference
---

<ComponentPreview styleName="radix-nova" name="popover-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add popover
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="popover"
  title="components/ui/popover.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
```

```tsx showLineNumbers
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Title</PopoverTitle>
      <PopoverDescription>Description text here.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>
```

## Examples

### Basic

A simple popover with a header, title, and description.

<ComponentPreview styleName="radix-nova" name="popover-basic" />

### Align

Use the `align` prop on `PopoverContent` to control the horizontal alignment.

<ComponentPreview styleName="radix-nova" name="popover-alignments" />

### With Form

A popover with form fields inside.

<ComponentPreview styleName="radix-nova" name="popover-form" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="popover-rtl" direction="rtl" />

## API Reference

See the [Radix UI Popover](https://www.radix-ui.com/docs/primitives/components/popover#api-reference) documentation.

## progress
---
title: Progress
description: Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/progress
  api: https://www.radix-ui.com/docs/primitives/components/progress#api-reference
---

<ComponentPreview styleName="radix-nova" name="progress-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add progress
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="progress"
  title="components/ui/progress.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Progress } from "@/components/ui/progress"
```

```tsx showLineNumbers
<Progress value={33} />
```

## Examples

### Label

Use a `Field` component to add a label to the progress bar.

<ComponentPreview styleName="radix-nova" name="progress-label" />

### Controlled

A progress bar that can be controlled by a slider.

<ComponentPreview styleName="radix-nova" name="progress-controlled" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="progress-rtl" direction="rtl" />

## API Reference

See the [Radix UI Progress](https://www.radix-ui.com/docs/primitives/components/progress#api-reference) documentation.

## radio group
---
title: Radio Group
description: A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/radio-group
  api: https://www.radix-ui.com/docs/primitives/components/radio-group#api-reference
---

<ComponentPreview styleName="radix-nova" name="radio-group-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add radio-group
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="radio-group"
  title="components/ui/radio-group.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
```

```tsx showLineNumbers
<RadioGroup defaultValue="option-one">
  <div className="flex items-center gap-3">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center gap-3">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>
```

## Examples

### Description

Radio group items with a description using the `Field` component.

<ComponentPreview styleName="radix-nova" name="radio-group-description" />

### Choice Card

Use `FieldLabel` to wrap the entire `Field` for a clickable card-style selection.

<ComponentPreview styleName="radix-nova" name="radio-group-choice-card" />

### Fieldset

Use `FieldSet` and `FieldLegend` to group radio items with a label and description.

<ComponentPreview styleName="radix-nova" name="radio-group-fieldset" />

### Disabled

Use the `disabled` prop on `RadioGroupItem` to disable individual items.

<ComponentPreview styleName="radix-nova" name="radio-group-disabled" />

### Invalid

Use `aria-invalid` on `RadioGroupItem` and `data-invalid` on `Field` to show validation errors.

<ComponentPreview styleName="radix-nova" name="radio-group-invalid" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="radio-group-rtl"
  direction="rtl"
/>

## API Reference

See the [Radix UI Radio Group](https://www.radix-ui.com/docs/primitives/components/radio-group#api-reference) documentation.

## resizable
---
title: Resizable
description: Accessible resizable panel groups and layouts with keyboard support.
base: radix
component: true
links:
  doc: https://github.com/bvaughn/react-resizable-panels
  api: https://github.com/bvaughn/react-resizable-panels/tree/main/packages/react-resizable-panels
---

<ComponentPreview
  styleName="radix-nova"
  name="resizable-demo"
  previewClassName="h-80"
/>

## About

The `Resizable` component is built on top of [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) by [bvaughn](https://github.com/bvaughn).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add resizable
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install react-resizable-panels
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="resizable"
  title="components/ui/resizable.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
```

```tsx showLineNumbers
<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel>One</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Two</ResizablePanel>
</ResizablePanelGroup>
```

## Examples

### Vertical

Use `orientation="vertical"` for vertical resizing.

<ComponentPreview styleName="radix-nova" name="resizable-vertical" />

### Handle

Use the `withHandle` prop on `ResizableHandle` to show a visible handle.

<ComponentPreview styleName="radix-nova" name="resizable-handle" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="resizable-rtl" direction="rtl" />

## API Reference

See the [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels/tree/main/packages/react-resizable-panels) documentation.

## Changelog

### 2025-02-02 `react-resizable-panels` v4

Updated to `react-resizable-panels` v4. See the [v4.0.0 release notes](https://github.com/bvaughn/react-resizable-panels/releases/tag/4.0.0) for full details.

If you're using `react-resizable-panels` primitives directly, note the following changes:

| v3                           | v4                      |
| ---------------------------- | ----------------------- |
| `PanelGroup`                 | `Group`                 |
| `PanelResizeHandle`          | `Separator`             |
| `direction` prop             | `orientation` prop      |
| `defaultSize={50}`           | `defaultSize="50%"`     |
| `onLayout`                   | `onLayoutChange`        |
| `ImperativePanelHandle`      | `PanelImperativeHandle` |
| `ref` prop on Panel          | `panelRef` prop         |
| `data-panel-group-direction` | `aria-orientation`      |

<Callout>
  The shadcn/ui wrapper components (`ResizablePanelGroup`, `ResizablePanel`,
  `ResizableHandle`) remain unchanged.
</Callout>

##  scroll area
---
title: Scroll Area
description: Augments native scroll functionality for custom, cross-browser styling.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/scroll-area
  api: https://www.radix-ui.com/docs/primitives/components/scroll-area#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="scroll-area-demo"
  previewClassName="h-96"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add scroll-area
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="scroll-area"
  title="components/ui/scroll-area.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
```

```tsx showLineNumbers
<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  Your scrollable content here.
</ScrollArea>
```

## Examples

### Horizontal

Use `ScrollBar` with `orientation="horizontal"` for horizontal scrolling.

<ComponentPreview styleName="radix-nova" name="scroll-area-horizontal-demo" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="scroll-area-rtl"
  direction="rtl"
  previewClassName="h-auto"
/>

## API Reference

See the [Radix UI Scroll Area](https://www.radix-ui.com/docs/primitives/components/scroll-area#api-reference) documentation.

## select
---
title: Select
description: Displays a list of options for the user to pick from—triggered by a button.
base: radix
component: true
featured: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/select
  api: https://www.radix-ui.com/docs/primitives/components/select#api-reference
---

<ComponentPreview styleName="radix-nova" name="select-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add select
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="select"
  title="components/ui/select.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
```

```tsx showLineNumbers
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
      <SelectItem value="system">System</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

## Examples

### Align Item With Trigger

Use the `position` prop on `SelectContent` to control alignment. When `position="item-aligned"` (default), the popup positions so the selected item appears over the trigger. When `position="popper"`, the popup aligns to the trigger edge.

<ComponentPreview styleName="radix-nova" name="select-align-item" />

### Groups

Use `SelectGroup`, `SelectLabel`, and `SelectSeparator` to organize items.

<ComponentPreview styleName="radix-nova" name="select-groups" />

### Scrollable

A select with many items that scrolls.

<ComponentPreview styleName="radix-nova" name="select-scrollable" />

### Disabled

<ComponentPreview styleName="radix-nova" name="select-disabled" />

### Invalid

Add the `data-invalid` attribute to the `Field` component and the `aria-invalid` attribute to the `SelectTrigger` component to show an error state.

```tsx showLineNumbers /data-invalid/ /aria-invalid/
<Field data-invalid>
  <FieldLabel>Fruit</FieldLabel>
  <SelectTrigger aria-invalid>
    <SelectValue />
  </SelectTrigger>
</Field>
```

<ComponentPreview styleName="radix-nova" name="select-invalid" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="select-rtl" direction="rtl" />

## API Reference

See the [Radix UI Select](https://www.radix-ui.com/docs/primitives/components/select#api-reference) documentation.

## separator
---
title: Separator
description: Visually or semantically separates content.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/separator
  api: https://www.radix-ui.com/docs/primitives/components/separator#api-reference
---

<ComponentPreview styleName="radix-nova" name="separator-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add separator
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="separator"
  title="components/ui/separator.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Separator } from "@/components/ui/separator"
```

```tsx showLineNumbers
<Separator />
```

## Examples

### Vertical

Use `orientation="vertical"` for a vertical separator.

<ComponentPreview styleName="radix-nova" name="separator-vertical" />

### Menu

Vertical separators between menu items with descriptions.

<ComponentPreview styleName="radix-nova" name="separator-menu" />

### List

Horizontal separators between list items.

<ComponentPreview styleName="radix-nova" name="separator-list" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="separator-rtl" direction="rtl" />

## API Reference

See the [Radix UI Separator](https://www.radix-ui.com/docs/primitives/components/separator#api-reference) documentation.

## sheet
---
title: Sheet
description: Extends the Dialog component to display content that complements the main content of the screen.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/dialog
  api: https://www.radix-ui.com/docs/primitives/components/dialog#api-reference
---

<ComponentPreview styleName="radix-nova" name="sheet-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add sheet
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="sheet"
  title="components/ui/sheet.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
```

```tsx showLineNumbers
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>This action cannot be undone.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

## Examples

### Side

Use the `side` prop on `SheetContent` to set the edge of the screen where the sheet appears. Values are `top`, `right`, `bottom`, or `left`.

<ComponentPreview styleName="radix-nova" name="sheet-side" />

### No Close Button

Use `showCloseButton={false}` on `SheetContent` to hide the close button.

<ComponentPreview styleName="radix-nova" name="sheet-no-close-button" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="sheet-rtl" direction="rtl" />

## API Reference

See the [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog#api-reference) documentation.

## sidebar
---
title: Sidebar
description: A composable, themeable and customizable sidebar component.
base: radix
component: true
---

import { ExternalLinkIcon } from "lucide-react"

<figure className="flex flex-col gap-4">
  <ComponentPreview
    styleName="radix-nova"
    name="sidebar-demo"
    type="block"
    className="w-full"
  />
  <figcaption className="text-center text-sm text-gray-500">
    A sidebar that collapses to icons.
  </figcaption>
</figure>

Sidebars are one of the most complex components to build. They are central
to any application and often contain a lot of moving parts.

We now have a solid foundation to build on top of. Composable. Themeable.
Customizable.

[Browse the Blocks Library](/blocks).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add sidebar
```

</TabsContent>

<TabsContent value="manual">

<ComponentSource
  name="sidebar"
  title="components/ui/sidebar.tsx"
  styleName="radix-nova"
/>

</TabsContent>

</CodeTabs>

## Structure

A `Sidebar` component is composed of the following parts:

- `SidebarProvider` - Handles collapsible state.
- `Sidebar` - The sidebar container.
- `SidebarHeader` and `SidebarFooter` - Sticky at the top and bottom of the sidebar.
- `SidebarContent` - Scrollable content.
- `SidebarGroup` - Section within the `SidebarContent`.
- `SidebarTrigger` - Trigger for the `Sidebar`.

<Image
  src="/images/sidebar-structure.png"
  width="716"
  height="420"
  alt="Sidebar Structure"
  className="mt-6 w-full overflow-hidden rounded-lg border dark:hidden"
/>
<Image
  src="/images/sidebar-structure-dark.png"
  width="716"
  height="420"
  alt="Sidebar Structure"
  className="mt-6 hidden w-full overflow-hidden rounded-lg border dark:block"
/>

## Usage

```tsx showLineNumbers title="app/layout.tsx"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

```tsx showLineNumbers title="components/app-sidebar.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
```

## SidebarProvider

The `SidebarProvider` component is used to provide the sidebar context to the `Sidebar` component. You should always wrap your application in a `SidebarProvider` component.

### Props

| Name           | Type                      | Description                                  |
| -------------- | ------------------------- | -------------------------------------------- |
| `defaultOpen`  | `boolean`                 | Default open state of the sidebar.           |
| `open`         | `boolean`                 | Open state of the sidebar (controlled).      |
| `onOpenChange` | `(open: boolean) => void` | Sets open state of the sidebar (controlled). |

### Width

If you have a single sidebar in your application, you can use the `SIDEBAR_WIDTH` and `SIDEBAR_WIDTH_MOBILE` variables in `sidebar.tsx` to set the width of the sidebar.

```tsx showLineNumbers title="components/ui/sidebar.tsx"
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
```

For multiple sidebars in your application, you can use the `--sidebar-width` and `--sidebar-width-mobile` CSS variables in the `style` prop.

```tsx showLineNumbers
<SidebarProvider
  style={
    {
      "--sidebar-width": "20rem",
      "--sidebar-width-mobile": "20rem",
    } as React.CSSProperties
  }
>
  <Sidebar />
</SidebarProvider>
```

### Keyboard Shortcut

To trigger the sidebar, you use the `cmd+b` keyboard shortcut on Mac and `ctrl+b` on Windows.

```tsx showLineNumbers title="components/ui/sidebar.tsx"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
```

## Sidebar

The main `Sidebar` component used to render a collapsible sidebar.

### Props

| Property      | Type                              | Description                       |
| ------------- | --------------------------------- | --------------------------------- |
| `side`        | `left` or `right`                 | The side of the sidebar.          |
| `variant`     | `sidebar`, `floating`, or `inset` | The variant of the sidebar.       |
| `collapsible` | `offcanvas`, `icon`, or `none`    | Collapsible state of the sidebar. |

| Prop        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `offcanvas` | A collapsible sidebar that slides in from the left or right. |
| `icon`      | A sidebar that collapses to icons.                           |
| `none`      | A non-collapsible sidebar.                                   |

<Callout>
  **Note:** If you use the `inset` variant, remember to wrap your main content
  in a `SidebarInset` component.
</Callout>

```tsx showLineNumbers
<SidebarProvider>
  <Sidebar variant="inset" />
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

## useSidebar

The `useSidebar` hook is used to control the sidebar.

```tsx showLineNumbers
import { useSidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()
}
```

| Property        | Type                      | Description                                   |
| --------------- | ------------------------- | --------------------------------------------- |
| `state`         | `expanded` or `collapsed` | The current state of the sidebar.             |
| `open`          | `boolean`                 | Whether the sidebar is open.                  |
| `setOpen`       | `(open: boolean) => void` | Sets the open state of the sidebar.           |
| `openMobile`    | `boolean`                 | Whether the sidebar is open on mobile.        |
| `setOpenMobile` | `(open: boolean) => void` | Sets the open state of the sidebar on mobile. |
| `isMobile`      | `boolean`                 | Whether the sidebar is on mobile.             |
| `toggleSidebar` | `() => void`              | Toggles the sidebar. Desktop and mobile.      |

## SidebarHeader

Use the `SidebarHeader` component to add a sticky header to the sidebar.

```tsx showLineNumbers title="components/app-sidebar.tsx"
<Sidebar>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              Select Workspace
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            <DropdownMenuItem>
              <span>Acme Inc</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
</Sidebar>
```

## SidebarFooter

Use the `SidebarFooter` component to add a sticky footer to the sidebar.

```tsx showLineNumbers
<Sidebar>
  <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <User2 /> Username
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</Sidebar>
```

## SidebarContent

The `SidebarContent` component is used to wrap the content of the sidebar. This is where you add your `SidebarGroup` components. It is scrollable.

```tsx showLineNumbers
<Sidebar>
  <SidebarContent>
    <SidebarGroup />
    <SidebarGroup />
  </SidebarContent>
</Sidebar>
```

## SidebarGroup

Use the `SidebarGroup` component to create a section within the sidebar.

A `SidebarGroup` has a `SidebarGroupLabel`, a `SidebarGroupContent` and an optional `SidebarGroupAction`.

```tsx showLineNumbers
<SidebarGroup>
  <SidebarGroupLabel>Application</SidebarGroupLabel>
  <SidebarGroupAction>
    <Plus /> <span className="sr-only">Add Project</span>
  </SidebarGroupAction>
  <SidebarGroupContent></SidebarGroupContent>
</SidebarGroup>
```

To make a `SidebarGroup` collapsible, wrap it in a `Collapsible`.

```tsx showLineNumbers
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger>
        Help
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent />
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

## SidebarMenu

The `SidebarMenu` component is used for building a menu within a `SidebarGroup`.

<Image
  src="/images/sidebar-menu.png"
  width="716"
  height="420"
  alt="Sidebar Menu"
  className="mt-6 w-full overflow-hidden rounded-lg border dark:hidden"
/>
<Image
  src="/images/sidebar-menu-dark.png"
  width="716"
  height="420"
  alt="Sidebar Menu"
  className="mt-6 hidden w-full overflow-hidden rounded-lg border dark:block"
/>

```tsx showLineNumbers
<SidebarMenu>
  {projects.map((project) => (
    <SidebarMenuItem key={project.name}>
      <SidebarMenuButton asChild>
        <a href={project.url}>
          <project.icon />
          <span>{project.name}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

## SidebarMenuButton

The `SidebarMenuButton` component is used to render a menu button within a `SidebarMenuItem`.

By default, the `SidebarMenuButton` renders a button but you can use the `asChild` prop to render a different component such as a `Link` or an `a` tag.

Use the `isActive` prop to mark a menu item as active.

```tsx showLineNumbers
<SidebarMenuButton asChild isActive>
  <a href="#">Home</a>
</SidebarMenuButton>
```

## SidebarMenuAction

The `SidebarMenuAction` component is used to render a menu action within a `SidebarMenuItem`.

```tsx showLineNumbers
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="#">
      <Home />
      <span>Home</span>
    </a>
  </SidebarMenuButton>
  <SidebarMenuAction>
    <Plus /> <span className="sr-only">Add Project</span>
  </SidebarMenuAction>
</SidebarMenuItem>
```

## SidebarMenuSub

The `SidebarMenuSub` component is used to render a submenu within a `SidebarMenu`.

```tsx showLineNumbers
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuSub>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton />
    </SidebarMenuSubItem>
  </SidebarMenuSub>
</SidebarMenuItem>
```

## SidebarMenuBadge

The `SidebarMenuBadge` component is used to render a badge within a `SidebarMenuItem`.

```tsx showLineNumbers
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuBadge>24</SidebarMenuBadge>
</SidebarMenuItem>
```

## SidebarMenuSkeleton

The `SidebarMenuSkeleton` component is used to render a skeleton for a `SidebarMenu`.

```tsx showLineNumbers
<SidebarMenu>
  {Array.from({ length: 5 }).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuSkeleton />
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

## SidebarTrigger

Use the `SidebarTrigger` component to render a button that toggles the sidebar.

```tsx showLineNumbers
import { useSidebar } from "@/components/ui/sidebar"

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()

  return <button onClick={toggleSidebar}>Toggle Sidebar</button>
}
```

## SidebarRail

The `SidebarRail` component is used to render a rail within a `Sidebar`. This rail can be used to toggle the sidebar.

```tsx showLineNumbers
<Sidebar>
  <SidebarHeader />
  <SidebarContent>
    <SidebarGroup />
  </SidebarContent>
  <SidebarFooter />
  <SidebarRail />
</Sidebar>
```

## Controlled Sidebar

Use the `open` and `onOpenChange` props to control the sidebar.

```tsx showLineNumbers
export function AppSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar />
    </SidebarProvider>
  )
}
```

## Theming

We use the following CSS variables to theme the sidebar.

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 0 0% 98%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

## Styling

Here are some tips for styling the sidebar based on different states.

```tsx
<Sidebar collapsible="icon">
  <SidebarContent>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden" />
  </SidebarContent>
</Sidebar>
```

```tsx
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuAction className="peer-data-[active=true]/menu-button:opacity-100" />
</SidebarMenuItem>
```

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

{/* prettier-ignore */}
<Button asChild size="sm" className="mt-6">
  <a href="/view/radix-nova/sidebar-rtl" target="_blank">View RTL Sidebar <ExternalLinkIcon /></a>
</Button>

## Changelog

### RTL Support

If you're upgrading from a previous version of the `Sidebar` component, you'll need to apply the following updates to add RTL support:

<Steps>

<Step>Add `dir` prop to Sidebar component.</Step>

Add `dir` to the destructured props and pass it to `SheetContent` for mobile:

```diff
  function Sidebar({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
+   dir,
    ...props
  }: React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }) {
```

Then pass it to `SheetContent` in the mobile view:

```diff
  <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
    <SheetContent
+     dir={dir}
      data-sidebar="sidebar"
      data-slot="sidebar"
      data-mobile="true"
```

<Step>Add `data-side` attribute to sidebar container.</Step>

Add `data-side={side}` to the sidebar container element:

```diff
  <div
    data-slot="sidebar-container"
+   data-side={side}
    className={cn(
```

<Step>Update sidebar container positioning classes.</Step>

Replace JavaScript ternary conditional classes with CSS data attribute selectors:

```diff
  className={cn(
-   "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
-   side === "left"
-     ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
-     : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
+   "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex data-[side=left]:left-0 data-[side=right]:right-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
```

<Step>Update SidebarRail positioning classes.</Step>

Update the `SidebarRail` component to use physical positioning for the rail:

```diff
  className={cn(
-   "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-end-4 group-data-[side=right]:start-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex",
+   "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 ltr:-translate-x-1/2 rtl:-translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex",
```

<Step>Add RTL flip to SidebarTrigger icon.</Step>

Add `className="rtl:rotate-180"` to the icon in `SidebarTrigger` to flip it in RTL mode:

```diff
  <Button ...>
-   <PanelLeftIcon />
+   <PanelLeftIcon className="rtl:rotate-180" />
    <span className="sr-only">Toggle Sidebar</span>
  </Button>
```

</Steps>

After applying these changes, you can use the `dir` prop to set the direction:

```tsx
<Sidebar dir="rtl" side="right">
  {/* ... */}
</Sidebar>
```

The sidebar will correctly position itself and handle interactions in both LTR and RTL layouts.

## skeleton
---
title: Skeleton
description: Use to show a placeholder while content is loading.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="skeleton-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add skeleton
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="skeleton"
  title="components/ui/skeleton.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

```tsx
<Skeleton className="h-[20px] w-[100px] rounded-full" />
```

## Examples

### Avatar

<ComponentPreview styleName="radix-nova" name="skeleton-avatar" />

### Card

<ComponentPreview
  styleName="radix-nova"
  name="skeleton-card"
  previewClassName="h-80"
/>

### Text

<ComponentPreview styleName="radix-nova" name="skeleton-text" />

### Form

<ComponentPreview styleName="radix-nova" name="skeleton-form" />

### Table

<ComponentPreview styleName="radix-nova" name="skeleton-table" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="skeleton-rtl" direction="rtl" />

## slider
---
title: Slider
description: An input where the user selects a value from within a given range.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/slider
  api: https://www.radix-ui.com/docs/primitives/components/slider#api-reference
---

<ComponentPreview styleName="radix-nova" name="slider-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add slider
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="slider"
  title="components/ui/slider.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Slider } from "@/components/ui/slider"
```

```tsx
<Slider defaultValue={[33]} max={100} step={1} />
```

## Examples

### Range

Use an array with two values for a range slider.

<ComponentPreview styleName="radix-nova" name="slider-range" />

### Multiple Thumbs

Use an array with multiple values for multiple thumbs.

<ComponentPreview styleName="radix-nova" name="slider-multiple" />

### Vertical

Use `orientation="vertical"` for a vertical slider.

<ComponentPreview styleName="radix-nova" name="slider-vertical" />

### Controlled

<ComponentPreview styleName="radix-nova" name="slider-controlled" />

### Disabled

Use the `disabled` prop to disable the slider.

<ComponentPreview styleName="radix-nova" name="slider-disabled" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="slider-rtl" direction="rtl" />

## API Reference

See the [Radix UI Slider](https://www.radix-ui.com/docs/primitives/components/slider#api-reference) documentation.

## sonnar
---
title: Sonner
description: An opinionated toast component for React.
base: radix
component: true
links:
  doc: https://sonner.emilkowal.ski
---

<ComponentPreview styleName="radix-nova" name="sonner-demo" />

## About

Sonner is built and maintained by [emilkowalski](https://twitter.com/emilkowalski).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

<Steps className="mb-0 pt-2">

<Step>Run the following command:</Step>

```bash
npx shadcn@latest add sonner
```

<Step>Add the Toaster component</Step>

```tsx title="app/layout.tsx" {1,9} showLineNumbers
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

</Steps>

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install sonner next-themes
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="sonner"
  title="components/ui/sonner.tsx"
  styleName="radix-nova"
/>

<Step>Add the Toaster component</Step>

```tsx showLineNumbers title="app/layout.tsx" {1,8}
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Toaster />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { toast } from "sonner"
```

```tsx
toast("Event has been created.")
```

## Examples

### Types

<ComponentPreview styleName="radix-nova" name="sonner-types" />

### Description

<ComponentPreview styleName="radix-nova" name="sonner-description" />

### Position

Use the `position` prop to change the position of the toast.

<ComponentPreview styleName="radix-nova" name="sonner-position" />

## API Reference

See the [Sonner API Reference](https://sonner.emilkowal.ski/getting-started) for more information.

## spinner
 ---
title: Spinner
description: An indicator that can be used to show a loading state.
base: radix
component: true
---

<ComponentPreview styleName="radix-nova" name="spinner-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add spinner
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="spinner"
  title="components/ui/spinner.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Spinner } from "@/components/ui/spinner"
```

```tsx
<Spinner />
```

## Customization

You can replace the default spinner icon with any other icon by editing the `Spinner` component.

<ComponentPreview styleName="radix-nova" name="spinner-custom" />

```tsx showLineNumbers title="components/ui/spinner.tsx"
import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
```

## Examples

### Size

Use the `size-*` utility class to change the size of the spinner.

<ComponentPreview styleName="radix-nova" name="spinner-size" />

### Button

Add a spinner to a button to indicate a loading state. Place the `<Spinner />` before the label with `data-icon="inline-start"` for a start position, or after the label with `data-icon="inline-end"` for an end position.

<ComponentPreview styleName="radix-nova" name="spinner-button" />

### Badge

Add a spinner to a badge to indicate a loading state. Place the `<Spinner />` before the label with `data-icon="inline-start"` for a start position, or after the label with `data-icon="inline-end"` for an end position.

<ComponentPreview styleName="radix-nova" name="spinner-badge" />

### Input Group

<ComponentPreview styleName="radix-nova" name="spinner-input-group" />

### Empty

<ComponentPreview styleName="radix-nova" name="spinner-empty" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="spinner-rtl" direction="rtl" />

## switch
 ---
title: Switch
description: A control that allows the user to toggle between checked and not checked.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/switch
  api: https://www.radix-ui.com/docs/primitives/components/switch#api-reference
---

<ComponentPreview styleName="radix-nova" name="switch-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add switch
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="switch"
  title="components/ui/switch.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Switch } from "@/components/ui/switch"
```

```tsx
<Switch />
```

## Examples

### Description

<ComponentPreview styleName="radix-nova" name="switch-description" />

### Choice Card

Card-style selection where `FieldLabel` wraps the entire `Field` for a clickable card pattern.

<ComponentPreview styleName="radix-nova" name="switch-choice-card" />

### Disabled

Add the `disabled` prop to the `Switch` component to disable the switch. Add the `data-disabled` prop to the `Field` component for styling.

<ComponentPreview styleName="radix-nova" name="switch-disabled" />

### Invalid

Add the `aria-invalid` prop to the `Switch` component to indicate an invalid state. Add the `data-invalid` prop to the `Field` component for styling.

<ComponentPreview styleName="radix-nova" name="switch-invalid" />

### Size

Use the `size` prop to change the size of the switch.

<ComponentPreview styleName="radix-nova" name="switch-sizes" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="switch-rtl" direction="rtl" />

## API Reference

See the [Radix Switch](https://www.radix-ui.com/docs/primitives/components/switch#api-reference) documentation.

## table
---
title: Table
description: A responsive table component.
base: radix
component: true
---

<ComponentPreview
  styleName="radix-nova"
  name="table-demo"
  previewClassName="h-[30rem]"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add table
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="table"
  title="components/ui/table.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
```

```tsx showLineNumbers
<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Examples

### Footer

Use the `<TableFooter />` component to add a footer to the table.

<ComponentPreview styleName="radix-nova" name="table-footer" />

### Actions

A table showing actions for each row using a `<DropdownMenu />` component.

<ComponentPreview styleName="radix-nova" name="table-actions" />

## Data Table

You can use the `<Table />` component to build more complex data tables. Combine it with [@tanstack/react-table](https://tanstack.com/table/v8) to create tables with sorting, filtering and pagination.

See the [Data Table](/docs/components/data-table) documentation for more information.

You can also see an example of a data table in the [Tasks](/examples/tasks) demo.

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="table-rtl"
  direction="rtl"
  previewClassName="h-auto"
/>

## tabs
---
title: Tabs
description: A set of layered sections of content—known as tab panels—that are displayed one at a time.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/tabs
  api: https://www.radix-ui.com/docs/primitives/components/tabs#api-reference
---

<ComponentPreview
  styleName="radix-nova"
  name="tabs-demo"
  previewClassName="h-96"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add tabs
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="tabs"
  title="components/ui/tabs.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

```tsx showLineNumbers
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Make changes to your account here.</TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs>
```

## Examples

### Line

Use the `variant="line"` prop on `TabsList` for a line style.

<ComponentPreview styleName="radix-nova" name="tabs-line" />

### Vertical

Use `orientation="vertical"` for vertical tabs.

<ComponentPreview styleName="radix-nova" name="tabs-vertical" />

### Disabled

<ComponentPreview styleName="radix-nova" name="tabs-disabled" />

### Icons

<ComponentPreview styleName="radix-nova" name="tabs-icons" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="tabs-rtl" direction="rtl" />

## API Reference

See the [Radix Tabs](https://www.radix-ui.com/docs/primitives/components/tabs#api-reference) documentation.

## textarea
---
title: Textarea
description: Displays a form textarea or a component that looks like a textarea.
base: radix
component: true
---

<ComponentPreview
  styleName="radix-nova"
  name="textarea-demo"
  previewClassName="*:max-w-xs"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add textarea
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="textarea"
  title="components/ui/textarea.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Textarea } from "@/components/ui/textarea"
```

```tsx
<Textarea />
```

## Examples

### Field

Use `Field`, `FieldLabel`, and `FieldDescription` to create a textarea with a label and description.

<ComponentPreview
  styleName="radix-nova"
  name="textarea-field"
  previewClassName="*:max-w-xs"
/>

### Disabled

Use the `disabled` prop to disable the textarea. To style the disabled state, add the `data-disabled` attribute to the `Field` component.

<ComponentPreview
  styleName="radix-nova"
  name="textarea-disabled"
  previewClassName="*:max-w-xs"
/>

### Invalid

Use the `aria-invalid` prop to mark the textarea as invalid. To style the invalid state, add the `data-invalid` attribute to the `Field` component.

<ComponentPreview
  styleName="radix-nova"
  name="textarea-invalid"
  previewClassName="*:max-w-xs"
/>

### Button

Pair with `Button` to create a textarea with a submit button.

<ComponentPreview
  styleName="radix-nova"
  name="textarea-button"
  previewClassName="*:max-w-xs"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="textarea-rtl" direction="rtl" />

## toast
---
title: Toast
description: A succinct message that is displayed temporarily.
base: base
component: true
---

The toast component has been deprecated. Use the [sonner](/docs/components/sonner) component instead.

## toggle
---
title: Toggle
description: A two-state button that can be either on or off.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/toggle
  api: https://www.radix-ui.com/docs/primitives/components/toggle#api-reference
---

<ComponentPreview styleName="radix-nova" name="toggle-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add toggle
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="toggle"
  title="components/ui/toggle.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Toggle } from "@/components/ui/toggle"
```

```tsx
<Toggle>Toggle</Toggle>
```

## Examples

### Outline

Use `variant="outline"` for an outline style.

<ComponentPreview styleName="radix-nova" name="toggle-outline" />

### With Text

<ComponentPreview styleName="radix-nova" name="toggle-text" />

### Size

Use the `size` prop to change the size of the toggle.

<ComponentPreview styleName="radix-nova" name="toggle-sizes" />

### Disabled

<ComponentPreview styleName="radix-nova" name="toggle-disabled" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="toggle-rtl" direction="rtl" />

## API Reference

See the [Radix Toggle](https://www.radix-ui.com/docs/primitives/components/toggle#api-reference) documentation.

## toggle group
---
title: Toggle Group
description: A set of two-state buttons that can be toggled on or off.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/toggle-group
  api: https://www.radix-ui.com/docs/primitives/components/toggle-group#api-reference
---

<ComponentPreview styleName="radix-nova" name="toggle-group-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add toggle-group
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="toggle-group"
  title="components/ui/toggle-group.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
```

```tsx
<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
  <ToggleGroupItem value="c">C</ToggleGroupItem>
</ToggleGroup>
```

## Examples

### Outline

Use `variant="outline"` for an outline style.

<ComponentPreview styleName="radix-nova" name="toggle-group-outline" />

### Size

Use the `size` prop to change the size of the toggle group.

<ComponentPreview styleName="radix-nova" name="toggle-group-sizes" />

### Spacing

Use `spacing` to add spacing between toggle group items.

<ComponentPreview styleName="radix-nova" name="toggle-group-spacing" />

### Vertical

Use `orientation="vertical"` for vertical toggle groups.

<ComponentPreview styleName="radix-nova" name="toggle-group-vertical" />

### Disabled

<ComponentPreview styleName="radix-nova" name="toggle-group-disabled" />

### Custom

A custom toggle group example.

<ComponentPreview
  styleName="radix-nova"
  name="toggle-group-font-weight-selector"
  previewClassName="*:data-[slot=field]:max-w-xs"
/>

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="toggle-group-rtl"
  direction="rtl"
/>

## API Reference

See the [Radix Toggle Group](https://www.radix-ui.com/docs/primitives/components/toggle-group#api-reference) documentation.

## tooltip
---
title: Tooltip
description: A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.
base: radix
component: true
links:
  doc: https://www.radix-ui.com/docs/primitives/components/tooltip
  api: https://www.radix-ui.com/docs/primitives/components/tooltip#api-reference
---

<ComponentPreview styleName="radix-nova" name="tooltip-demo" />

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

<Steps className="mb-0 pt-2">

<Step>Run the following command:</Step>

```bash
npx shadcn@latest add tooltip
```

<Step>Add the `TooltipProvider` to the root of your app.</Step>

```tsx title="app/layout.tsx" showLineNumbers {1,7}
import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
```

</Steps>

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install radix-ui
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="tooltip"
  title="components/ui/tooltip.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

<Step>Add the `TooltipProvider` to the root of your app.</Step>

```tsx title="app/layout.tsx" showLineNumbers {1,7}
import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
```

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
```

```tsx showLineNumbers
<Tooltip>
  <TooltipTrigger>Hover</TooltipTrigger>
  <TooltipContent>
    <p>Add to library</p>
  </TooltipContent>
</Tooltip>
```

## Examples

### Side

Use the `side` prop to change the position of the tooltip.

<ComponentPreview styleName="radix-nova" name="tooltip-sides" />

### With Keyboard Shortcut

<ComponentPreview styleName="radix-nova" name="tooltip-keyboard" />

### Disabled Button

Show a tooltip on a disabled button by wrapping it with a span.

<ComponentPreview styleName="radix-nova" name="tooltip-disabled" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview styleName="radix-nova" name="tooltip-rtl" direction="rtl" />

## API Reference

See the [Radix Tooltip](https://www.radix-ui.com/docs/primitives/components/tooltip#api-reference) documentation.

## typography
---
title: Typography
description: Styles for headings, paragraphs, lists, etc.
base: radix
component: true
---

We do not ship any typography styles by default. This page is an example of how you can use utility classes to style your text.

<ComponentPreview
  styleName="radix-nova"
  name="typography-demo"
  className="[&_.preview]:h-auto!"
  hideCode
/>

## h1

<ComponentPreview styleName="radix-nova" name="typography-h1" />

## h2

<ComponentPreview styleName="radix-nova" name="typography-h2" />

## h3

<ComponentPreview styleName="radix-nova" name="typography-h3" />

## h4

<ComponentPreview styleName="radix-nova" name="typography-h4" />

## p

<ComponentPreview styleName="radix-nova" name="typography-p" />

## blockquote

<ComponentPreview styleName="radix-nova" name="typography-blockquote" />

## table

<ComponentPreview styleName="radix-nova" name="typography-table" />

## list

<ComponentPreview styleName="radix-nova" name="typography-list" />

## Inline code

<ComponentPreview styleName="radix-nova" name="typography-inline-code" />

## Lead

<ComponentPreview styleName="radix-nova" name="typography-lead" />

## Large

<ComponentPreview styleName="radix-nova" name="typography-large" />

## Small

<ComponentPreview styleName="radix-nova" name="typography-small" />

## Muted

<ComponentPreview styleName="radix-nova" name="typography-muted" />

## RTL

To enable RTL support in shadcn/ui, see the [RTL configuration guide](/docs/rtl).

<ComponentPreview
  styleName="radix-nova"
  name="typography-rtl"
  direction="rtl"
  className="[&_.preview]:h-auto!"
/>

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
