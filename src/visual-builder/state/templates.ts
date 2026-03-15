import type { PageElement } from "./schema";

export const COMPONENT_TEMPLATES: { id: string; label: string; icon: string; element: PageElement }[] = [
  {
    id: "hero",
    label: "Hero",
    icon: "🎯",
    element: {
      id: "",
      type: "hero",
      styles: {
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        padding: "80px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
      },
      children: [
        {
          id: "",
          type: "heading",
          content: "Build Something Amazing",
          styles: { fontSize: "48px", fontWeight: "bold", margin: "0" },
        },
        {
          id: "",
          type: "text",
          content: "Create stunning websites with our visual builder. No code required.",
          styles: { fontSize: "18px", margin: "0", opacity: "0.9" },
        },
        {
          id: "",
          type: "button",
          content: "Get Started",
          styles: {
            backgroundColor: "#3b82f6",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
          },
        },
      ],
    },
  },
  {
    id: "navbar",
    label: "Navbar",
    icon: "📌",
    element: {
      id: "",
      type: "navbar",
      styles: {
        backgroundColor: "#1e293b",
        color: "#f8fafc",
        padding: "16px 24px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      children: [
        {
          id: "",
          type: "heading",
          content: "Logo",
          styles: { fontSize: "20px", fontWeight: "bold", margin: "0" },
        },
        {
          id: "",
          type: "container",
          styles: { display: "flex", gap: "24px" },
          children: [
            { id: "", type: "text", content: "Home", styles: {} },
            { id: "", type: "text", content: "About", styles: {} },
            { id: "", type: "text", content: "Contact", styles: {} },
          ],
        },
      ],
    },
  },
  {
    id: "card",
    label: "Card",
    icon: "🃏",
    element: {
      id: "",
      type: "card",
      styles: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      },
      children: [
        {
          id: "",
          type: "heading",
          content: "Card Title",
          styles: { fontSize: "24px", fontWeight: "600", margin: "0" },
        },
        {
          id: "",
          type: "text",
          content: "Add your card content here. Customize text, colors, and layout.",
          styles: { fontSize: "14px", margin: "0", color: "#64748b" },
        },
      ],
    },
  },
  {
    id: "form",
    label: "Form",
    icon: "📝",
    element: {
      id: "",
      type: "form",
      styles: {
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      },
      children: [
        {
          id: "",
          type: "heading",
          content: "Contact Us",
          styles: { fontSize: "24px", margin: "0" },
        },
        {
          id: "",
          type: "text",
          content: "Name",
          styles: { fontSize: "14px", margin: "0" },
        },
        {
          id: "",
          type: "text",
          content: "Email",
          styles: { fontSize: "14px", margin: "0" },
        },
        {
          id: "",
          type: "button",
          content: "Submit",
          styles: {
            backgroundColor: "#3b82f6",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            alignSelf: "flex-start",
          },
        },
      ],
    },
  },
  {
    id: "columns",
    label: "Columns",
    icon: "📊",
    element: {
      id: "",
      type: "columns",
      styles: {
        display: "flex",
        flexDirection: "row",
        gap: "24px",
        padding: "24px",
      },
      children: [
        {
          id: "",
          type: "container",
          styles: { flex: "1", padding: "16px", backgroundColor: "#f1f5f9", borderRadius: "8px" },
          children: [{ id: "", type: "text", content: "Column 1", styles: {} }],
        },
        {
          id: "",
          type: "container",
          styles: { flex: "1", padding: "16px", backgroundColor: "#f1f5f9", borderRadius: "8px" },
          children: [{ id: "", type: "text", content: "Column 2", styles: {} }],
        },
      ],
    },
  },
  {
    id: "text",
    label: "Text",
    icon: "📄",
    element: { id: "", type: "text", content: "Add your text here", styles: {} },
  },
  {
    id: "heading",
    label: "Heading",
    icon: "H",
    element: {
      id: "",
      type: "heading",
      content: "Heading",
      styles: { fontSize: "32px", fontWeight: "bold" },
    },
  },
  {
    id: "image",
    label: "Image",
    icon: "🖼️",
    element: {
      id: "",
      type: "image",
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      alt: "Placeholder",
      styles: { width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px" },
    },
  },
  {
    id: "button",
    label: "Button",
    icon: "🔘",
    element: {
      id: "",
      type: "button",
      content: "Click me",
      styles: {
        backgroundColor: "#3b82f6",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "6px",
        border: "none",
      },
    },
  },
];
