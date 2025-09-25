import axios from "axios";

 const registerNavbarBlock = (editor) => {
  editor.BlockManager.add("menu-navbar", {
    label: "📂 Navbar Menu",
    category: "Navigation",
    content: `<nav class="navbar"><ul id="dynamic-navbar-menu"></ul></nav>`,
  });

  // Fetch menus and inject them into the block
  editor.on("block:drag:stop", async (block) => {
    if (block?.id !== "menu-navbar") return;

    try {
      const { data: menus } = await axios.get(
        "http://localhost:8000/api/menus/navbar"
      );
      console.log("✅ Loaded Menus:", menus);

      const renderMenu = (menu) => {
        const hasChildren = menu.children && menu.children.length > 0;
        return `
          <li class="menu-item">
            <a href="${menu.url || "#"}">${menu.title}</a>
            ${
              hasChildren
                ? `<ul class="submenu">
                    ${menu.children.map(renderMenu).join("")}
                  </ul>`
                : ""
            }
          </li>
        `;
      };

      const html = menus.map(renderMenu).join("");

      const doc = editor.Canvas.getDocument();
      const ul = doc.querySelector("#dynamic-navbar-menu");
      if (ul) {
        ul.innerHTML = html;
      }
    } catch (err) {
      console.error("❌ Failed to load menus:", err);
    }
  });
};

export default registerNavbarBlock; 