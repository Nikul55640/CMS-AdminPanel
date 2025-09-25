import axios from "axios";
 const registerFooterBlock = (editor) => {
  editor.BlockManager.add("menu-footer", {
    label: "📁 Footer Menu",
    category: "Navigation",
    content: `<footer class="footer"><ul id="dynamic-footer-menu"></ul></footer>`,
  });

  editor.on("block:drag:stop", async (block) => {
    if (block?.id !== "menu-footer") return;

    try {
      const { data: menus } = await axios.get(
        "http://localhost:8000/api/menus/footer"
      );

      const renderMenu = (menu) => `
        <li class="menu-item">
          <a href="${menu.url || "#"}">${menu.title}</a>
          ${
            menu.children?.length
              ? `<ul class="submenu">${menu.children
                  .map(renderMenu)
                  .join("")}</ul>`
              : ""
          }
        </li>
      `;

      const doc = editor.Canvas.getDocument();
      const ul = doc.querySelector("#dynamic-footer-menu");
      if (ul) {
        ul.innerHTML = menus.map(renderMenu).join("");
      }
    } catch (err) {
      console.error("❌ Failed to load footer menus:", err);
    }
  });
};

export default registerFooterBlock;