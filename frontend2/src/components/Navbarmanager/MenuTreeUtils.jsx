// // Move an item in nested menu tree
// export const moveItemInTree = (menus, activeId, overId) => {
//   const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
//   const newMenus = deepClone(menus);

//   const findAndRemove = (items, id) => {
//     for (let i = 0; i < items.length; i++) {
//       if (items[i].id === id) {
//         return items.splice(i, 1)[0];
//       }
//       if (items[i].children?.length) {
//         const found = findAndRemove(items[i].children, id);
//         if (found) return found;
//       }
//     }
//     return null;
//   };

//   const insertItem = (items, id, newItem) => {
//     for (let i = 0; i < items.length; i++) {
//       if (items[i].id === id) {
//         items.splice(i + 1, 0, newItem);
//         return true;
//       }
//       if (items[i].children?.length) {
//         const inserted = insertItem(items[i].children, id, newItem);
//         if (inserted) return true;
//       }
//     }
//     return false;
//   };

//   const draggedItem = findAndRemove(newMenus, activeId);
//   if (!draggedItem) return newMenus;

//   if (!insertItem(newMenus, overId, draggedItem)) newMenus.push(draggedItem);
//   return newMenus;
// };

// // Find menu by ID
// export const findMenuById = (menus, id) => {
//   for (const item of menus) {
//     if (item.id === id) return item;
//     if (item.children?.length) {
//       const found = findMenuById(item.children, id);
//       if (found) return found;
//     }
//   }
//   return null;
// };

// // Get all nested menu IDs
// export const getAllMenuIds = (menu) => {
//   const ids = [];
//   const traverse = (item) => {
//     ids.push(String(item.id));
//     if (item.children?.length) item.children.forEach(traverse);
//   };
//   traverse(menu);
//   return ids;
// };



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

const getAllMenuIds = (menu) => {
  let ids = [String(menu.id)];
  if (menu.children?.length) {
    menu.children.forEach((child) => {
      ids = ids.concat(getAllMenuIds(child));
    });
  }
  return ids;
};

const findMenuById = (items, id) => {
  for (const item of items) {
    if (String(item.id) === String(id)) return item;
    if (item.children) {
      const found = findMenuById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

export { moveItemInTree, getAllMenuIds, findMenuById };