# Component Reference Library

Pre-defined UI patterns for web development prompts. When implementing components, use these references to ensure consistent, modern output.

## How It Works

1. **Cursor rule** (`.cursor/rules/web-development.mdc`) maps prompt keywords to components
2. **Reference files** in this folder contain full code and usage examples
3. AI uses these patterns when prompts match (e.g., "accordion", "FAQ", "expandable")

## Adding New Components

1. Create `docs/component-reference/<component-name>.md`
2. Include: base (Radix/shadcn), style, installation, source code, usage examples
3. Update `.cursor/rules/web-development.mdc` component mapping table

## Current References

| Component | File | Keywords |
|-----------|------|----------|
| Accordion | [accordion.md](./accordion.md) | accordion, FAQ, expandable, collapsible |

## Theme

- **Design system**: Radix UI + shadcn/ui (radix-nova)
- **Colors**: Use semantic tokens (foreground, muted-foreground, primary, border, card)
- **Animations**: tailwindcss-animate
