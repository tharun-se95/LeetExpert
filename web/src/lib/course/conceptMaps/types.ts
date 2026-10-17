export interface MindMapNode {
  id: string;
  label: string;
  href?: string;
  children?: MindMapNode[];
}
