



const moveItemInTree = (tree, itemId, overId) => {
  console.log("moveItemInTree called:", { itemId, overId });
  let itemToMove;

  const removeItem = (nodes) =>
    nodes
      .map((node) => {
        if (node.id === itemId) {
          itemToMove = node;
          return null;
        }
        if (node.children) {
          node.children = removeItem(node.children).filter(Boolean);
        }
        return node;
      })
      .filter(Boolean);

  const insertItem = (nodes) =>
    nodes.map((node) => {
      if (node.id === overId) {
        node.children = node.children || [];
        node.children.push(itemToMove);
      } else if (node.children) {
        node.children = insertItem(node.children);
      }
      return node;
    });

  let newTree = removeItem([...tree]);
  newTree = insertItem(newTree);
  console.log("New menu tree:", newTree);
  return newTree;
};

const getAllMenuIds = (items) => {
  const ids = [];

  const traverse = (arr) => {
    for (const item of arr) {
      if (!item || !item.id) continue;
      ids.push(String(item.id));
      if (Array.isArray(item.children) && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  if (Array.isArray(items)) {
    traverse(items);
  } else if (items && items.id) {
    traverse([items]);
  }

  return ids.filter(Boolean);
};

const findMenuById = (items, id) => {
  if (!Array.isArray(items)) return null;

  for (const item of items) {
    if (!item) continue;
    if (String(item.id) === String(id)) return item;
    if (Array.isArray(item.children) && item.children.length > 0) {
      const found = findMenuById(item.children, id);
      if (found) return found;
    }
  }

  return null;
};

export { moveItemInTree, getAllMenuIds, findMenuById };
