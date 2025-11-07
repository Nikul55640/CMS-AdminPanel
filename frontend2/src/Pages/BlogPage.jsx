import { Plus, Trash } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";


const BlogPage = () => {
  return (
    <>
      <div className="max-w-3xl mx-auto mt-12 shadow-2xl rounded-2xl">
        <div className=" bg-gradient-to-r from-blue-500 to-purple-500 mt-8 p-3  max-w-3xl rounded-t-2xl  text-white flex justify-center">
          <h1 className="text-3xl font-bold tracking-wide">BlogPage</h1>
        </div>
        <div className="p-8 space-y-6 border-1 rounded-br-2xl rounded-bl-2xl">
          <div  className="flex justify-end gap-2">
            <Link
              to="/admin/blog/addblog"
              className="bg-blue-600 flex justify-center text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform  "
            >
              <Plus size={22}/>Add
            </Link>
            <button className="bg-red-600 flex justify-center rounded-lg px-4 py-2 text-white "><Trash size={22}/>Delete</button>
          </div>
          <div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
