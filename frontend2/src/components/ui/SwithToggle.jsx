import React from "react";

const SwitchToggle = ({ checked, onChange, label = "Toggle Switch" }) => {
  return (
    <div className="flex items-center justify-center">
      {/* Hidden checkbox */}
      <input
        type="checkbox"
        id="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />

      {/* Toggle label */}
      <label
        htmlFor="switch"
        className={`relative inline-block w-28 h-14 cursor-pointer rounded-full transition-colors duration-300 ${
          checked ? "bg-green-400" : "bg-gray-400"
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`absolute top-1 left-1 w-12 h-12 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? "translate-x-14" : "translate-x-0"
          }`}
        ></span>
      </label>
    </div>
  );
};

export default SwitchToggle;
