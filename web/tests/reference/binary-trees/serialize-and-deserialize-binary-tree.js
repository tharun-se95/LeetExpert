class Codec {
  serialize(root) {
    const out = [];
    const walk = (node) => {
      if (node === null) {
        out.push("#");
        return;
      }
      out.push(String(node.val));
      walk(node.left);
      walk(node.right);
    };
    walk(root);
    return out.join(",");
  }

  deserialize(data) {
    const tokens = data.split(",");
    let i = 0;
    const build = () => {
      const token = tokens[i++];
      if (token === "#") return null;
      const node = new TreeNode(Number(token));
      node.left = build();
      node.right = build();
      return node;
    };
    return build();
  }
}
