# Component Reference Library

Pre-defined UI patterns for web development prompts. When implementing components, use these references to ensure consistent, modern output.

## How It Works

1. **Cursor rule** (`.cursor/rules/web-development.mdc`) maps prompt keywords to components
2. **Reference files** in this folder contain full code and usage examples
3. AI uses these patterns when prompts match (e.g., "accordion", "FAQ", "expandable")

## Adding New Components

1. **Copy the template**: `cp _template.md <component-name>.md`
2. **Fill in** all `[PLACEHOLDERS]` in the new file
3. **Update** `.cursor/rules/web-development.mdc` component mapping table
4. **Update** the Current References table below

## Current References

| Component | File | Keywords |
|-----------|------|----------|
| Accordion | [accordion.md](./accordion.md) | accordion, FAQ, expandable, collapsible |
| Tabs | [tabs.md](./tabs.md) | tabs, tabbed interface, switch views |
| Alert | [alert.md](./alert.md) | alert, callout, notice, banner, info box |
| Alert Dialog | [alert-dialog.md](./alert-dialog.md) | confirm dialog, delete confirmation |
| *(template)* | [_template.md](./_template.md) | Copy this to add new components |

## Theme

- **Design system**: Radix UI + shadcn/ui (radix-nova)
- **Colors**: Use semantic tokens (foreground, muted-foreground, primary, border, card)
- **Animations**: tailwindcss-animate
