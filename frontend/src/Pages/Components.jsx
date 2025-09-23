// 
import { useState, useEffect } from "react";
import axios from "axios";

// Live preview of Navbar
const NavbarPreview = ({ items }) => (
  <nav className="bg-gray-800 text-white p-4 rounded mb-4">
    <ul className="flex space-x-4">
      {items.map((item) => (
        <li key={item.id} className="relative group">
          <a href={item.link || "#"}>{item.label}</a>
          {item.children && item.children.length > 0 && (
            <ul className="absolute hidden group-hover:block bg-white text-black mt-2 p-2 rounded shadow">
              {item.children.map((child) => (
                <li key={child.id}>
                  <a href={child.link || "#"} className="block p-1">
                    {child.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </nav>
);

const ComponentBuilder = () => {
  const [components, setComponents] = useState([]);
  const [componentName, setComponentName] = useState("");

  // Load existing components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const res = await axios.get("/api/components", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setComponents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComponents();
  }, []);

  // Add new component
  const addComponent = () => {
    if (!componentName) return;
    setComponents([
      ...components,
      { id: Date.now(), name: componentName, items: [] },
    ]);
    setComponentName("");
  };

  // CRUD functions
  const removeComponent = (compId) =>
    setComponents(components.filter((c) => c.id !== compId));

  const addItem = (compId) =>
    setComponents(
      components.map((c) =>
        c.id === compId
          ? { ...c, items: [...c.items, { id: Date.now(), label: "", link: "", children: [] }] }
          : c
      )
    );

  const removeItem = (compId, itemId) =>
    setComponents(
      components.map((c) =>
        c.id === compId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    );

  const addSubItem = (compId, itemId) =>
    setComponents(
      components.map((c) =>
        c.id === compId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId
                  ? { ...i, children: [...i.children, { id: Date.now(), label: "", link: "" }] }
                  : i
              ),
            }
          : c
      )
    );

  const removeSubItem = (compId, itemId, subId) =>
    setComponents(
      components.map((c) =>
        c.id === compId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, children: i.children.filter((child) => child.id !== subId) } : i
              ),
            }
          : c
      )
    );

  const updateLabel = (compId, itemId, subId, value, type = "label") =>
    setComponents(
      components.map((c) =>
        c.id === compId
          ? {
              ...c,
              items: c.items.map((i) => {
                if (i.id === itemId) {
                  if (subId) {
                    return { ...i, children: i.children.map((child) => (child.id === subId ? { ...child, [type]: value } : child)) };
                  } else {
                    return { ...i, [type]: value };
                  }
                }
                return i;
              }),
            }
          : c
      )
    );

  // Save component to backend
  const saveComponent = async (comp) => {
    try {
      await axios.post(
        "/api/components",
        { name: comp.name, category: "Navigation", html: "", css: "", js: "", items: comp.items },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Component saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save component");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Component Builder</h2>

      {/* Add Component */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Component Name"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          className="border p-2 rounded w-1/2 mr-2"
        />
        <button onClick={addComponent} className="bg-green-600 text-white px-4 py-2 rounded">
          Add Component
        </button>
      </div>

      {/* Components List */}
      {components.map((comp) => (
        <div key={comp.id} className="border p-4 rounded mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">{comp.name}</h3>
            <div>
              <button onClick={() => removeComponent(comp.id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">
                Remove
              </button>
              <button onClick={() => saveComponent(comp)} className="bg-indigo-600 text-white px-2 py-1 rounded">
                Save
              </button>
            </div>
          </div>

          <button onClick={() => addItem(comp.id)} className="bg-blue-500 text-white px-2 py-1 rounded mb-2">
            + Add Item
          </button>

          {comp.items.map((item) => (
            <div key={item.id} className="ml-4 mb-2 border p-2 rounded">
              <div className="flex items-center mb-1">
                <input type="text" placeholder="Item Label" value={item.label} onChange={(e) => updateLabel(comp.id, item.id, null, e.target.value)} className="border p-1 rounded w-1/3 mr-2" />
                <input type="text" placeholder="Item Link" value={item.link} onChange={(e) => updateLabel(comp.id, item.id, null, e.target.value, "link")} className="border p-1 rounded w-1/3 mr-2" />
                <button onClick={() => removeItem(comp.id, item.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                  Remove Item
                </button>
              </div>

              {/* Subitems */}
              <button onClick={() => addSubItem(comp.id, item.id)} className="bg-gray-500 text-white px-2 py-1 rounded mb-1">
                + Add Subitem
              </button>
              {item.children.map((child) => (
                <div key={child.id} className="ml-4 mb-1 flex items-center">
                  <input type="text" placeholder="Subitem Label" value={child.label} onChange={(e) => updateLabel(comp.id, item.id, child.id, e.target.value)} className="border p-1 rounded w-1/3 mr-2" />
                  <input type="text" placeholder="Subitem Link" value={child.link} onChange={(e) => updateLabel(comp.id, item.id, child.id, e.target.value, "link")} className="border p-1 rounded w-1/3 mr-2" />
                  <button onClick={() => removeSubItem(comp.id, item.id, child.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                    Remove Subitem
                  </button>
                </div>
              ))}
            </div>
          ))}

          {/* Live Preview */}
          {comp.items.length > 0 && <NavbarPreview items={comp.items} />}
        </div>
      ))}
    </div>
  );
};

export default ComponentBuilder;
