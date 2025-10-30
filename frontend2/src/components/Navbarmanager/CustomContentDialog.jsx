import React from "react";
import { X } from "lucide-react";

const tabs = ["HTML", "CSS", "JS"];

const CustomContentDialog = ({
  open,
  onClose,
  customHTML,
  customCSS,
  customJS,
  setCustomHTML,
  setCustomCSS,
  setCustomJS,
  customActiveTab,
  setCustomActiveTab,
  onSave,
  onDelete,
}) => {
  if (!open) return null;

  const activeContent =
    customActiveTab === "HTML"
      ? customHTML
      : customActiveTab === "CSS"
      ? customCSS
      : customJS;

  const setActiveContent =
    customActiveTab === "HTML"
      ? setCustomHTML
      : customActiveTab === "CSS"
      ? setCustomCSS
      : setCustomJS;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg text-gray-800">Custom Navbar Content</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCustomActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium ${
                customActiveTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <textarea
          className="flex-1 p-3 font-mono text-sm outline-none resize-none"
          placeholder={`Write your ${customActiveTab} here...`}
          value={activeContent}
          onChange={(e) => setActiveContent(e.target.value)}
        />

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomContentDialog;
