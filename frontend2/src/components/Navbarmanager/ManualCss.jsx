import React, { useState } from "react";

const ManualCss = () => {
  const [styles, setStyles] = useState(() => {
    const saved = localStorage.getItem("navbarStyle");
    return (
      JSON.parse(saved) || {
        backgroundType: "solid",
        backgroundColor: "#ffffff",
        gradientFrom: "#4f46e5",
        gradientTo: "#9333ea",
        gradientDirection: "to right",
        textColor: "#000000",
        hoverColor: "#007bff",
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        fontWeight: "400",
        textTransform: "none",
        letterSpacing: "0px",
        textAlign: "center",
        padding: "12px 24px",
        linkSpacing: "15px",
        borderRadius: "0px",
        boxShadow: "none",
        hoverTransition: "0.3s",
        width: "100%",
        height: "auto",
        linkPadding: "8px 16px",
        linkBorderRadius: "4px",
      }
    );
  });

  const handleChange = (key, value) => {
    setStyles((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("navbarStyle", JSON.stringify(styles));
    window.dispatchEvent(new Event("navbarStyleUpdated"));
    alert("Navbar style saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Navbar Style Builder
      </h2>

      <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Background Type */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Background Type
          </label>
          <select
            value={styles.backgroundType}
            onChange={(e) => handleChange("backgroundType", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>

        {/* Solid Background */}
        {styles.backgroundType === "solid" && (
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Background Color
            </label>
            <input
              type="color"
              value={styles.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
            />
          </div>
        )}

        {/* Gradient Background */}
        {styles.backgroundType === "gradient" && (
          <>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Gradient From
              </label>
              <input
                type="color"
                value={styles.gradientFrom}
                onChange={(e) => handleChange("gradientFrom", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Gradient To
              </label>
              <input
                type="color"
                value={styles.gradientTo}
                onChange={(e) => handleChange("gradientTo", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Gradient Direction
              </label>
              <select
                value={styles.gradientDirection}
                onChange={(e) =>
                  handleChange("gradientDirection", e.target.value)
                }
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="to right">Left → Right</option>
                <option value="to left">Right → Left</option>
                <option value="to bottom">Top → Bottom</option>
                <option value="to top">Bottom → Top</option>
              </select>
            </div>
          </>
        )}

        {/* Text Color */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Text Color
          </label>
          <input
            type="color"
            value={styles.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
          />
        </div>

        {/* Hover Color */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Hover Color
          </label>
          <input
            type="color"
            value={styles.hoverColor}
            onChange={(e) => handleChange("hoverColor", e.target.value)}
          />
        </div>

        {/* Font Family */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Font Family
          </label>
          <select
            value={styles.fontFamily}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Poppins', sans-serif">Poppins</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
          </select>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Font Weight
          </label>
          <select
            value={styles.fontWeight}
            onChange={(e) => handleChange("fontWeight", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="300">Light</option>
            <option value="400">Normal</option>
            <option value="600">Semi-Bold</option>
            <option value="700">Bold</option>
          </select>
        </div>

        {/* Text Transform */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Text Transform
          </label>
          <select
            value={styles.textTransform}
            onChange={(e) => handleChange("textTransform", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>

        {/* Letter Spacing */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Letter Spacing
          </label>
          <input
            type="text"
            value={styles.letterSpacing}
            onChange={(e) => handleChange("letterSpacing", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            placeholder="e.g. 1px"
          />
        </div>

        {/* Link Spacing */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Link Spacing
          </label>
          <input
            type="text"
            value={styles.linkSpacing}
            onChange={(e) => handleChange("linkSpacing", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* Link Padding */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Link Padding
          </label>
          <input
            type="text"
            value={styles.linkPadding}
            onChange={(e) => handleChange("linkPadding", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            placeholder="e.g. 8px 16px"
          />
        </div>

        {/* Border Radius */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Link Border Radius
          </label>
          <input
            type="text"
            value={styles.linkBorderRadius}
            onChange={(e) => handleChange("linkBorderRadius", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            placeholder="e.g. 4px"
          />
        </div>

        {/* Box Shadow */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Box Shadow
          </label>
          <input
            type="text"
            value={styles.boxShadow}
            onChange={(e) => handleChange("boxShadow", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            placeholder="e.g. 0px 4px 6px rgba(0,0,0,0.1)"
          />
        </div>

        {/* Hover Transition */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Hover Transition (s)
          </label>
          <input
            type="text"
            value={styles.hoverTransition}
            onChange={(e) => handleChange("hoverTransition", e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
      </form>

      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium"
      >
        Save Style
      </button>
    </div>
  );
};

export default ManualCss;
