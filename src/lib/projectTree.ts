export interface ProjectTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectTreeNode[];
  isOpen?: boolean;
}

export function insertProjectFile(
  tree: ProjectTreeNode[],
  filePath: string,
  file: { language?: string; content?: string },
): ProjectTreeNode[] {
  const parts = filePath.split("/").filter(Boolean);
  if (parts.length === 0) return tree;
  const fileName = parts[parts.length - 1];

  const walk = (nodes: ProjectTreeNode[], depth: number): ProjectTreeNode[] => {
    if (depth === parts.length - 1) {
      const id = parts.join("/");
      const next = { id, name: fileName, type: "file" as const, language: file.language, content: file.content };
      if (nodes.some((node) => node.id === id)) {
        return nodes.map((node) => (node.id === id ? { ...node, ...next, type: "file" } : node));
      }
      return [...nodes, next];
    }

    const folderId = parts.slice(0, depth + 1).join("/");
    const existing = nodes.find((node) => node.id === folderId && node.type === "folder");
    if (existing) {
      return nodes.map((node) => (
        node.id === folderId
          ? { ...node, isOpen: true, children: walk(node.children || [], depth + 1) }
          : node
      ));
    }
    return [
      ...nodes,
      {
        id: folderId,
        name: parts[depth],
        type: "folder",
        isOpen: true,
        children: walk([], depth + 1),
      },
    ];
  };

  return walk(tree, 0);
}

export function readProjectFile(tree: ProjectTreeNode[], filePath: string): string | undefined {
  const walk = (nodes: ProjectTreeNode[]): string | undefined => {
    for (const node of nodes) {
      if (node.type === "file" && node.id === filePath) return node.content;
      if (node.children) {
        const found = walk(node.children);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  };
  return walk(tree);
}
