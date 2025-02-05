import React from "react";

export default function DeleteConformForm({
  handleDeleteConfirm,
  handleDeleteCancel,
}) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
      <div className="relative p-4 bg-gray-900 rounded-lg shadow-md max-w-sm w-full">
        <h1 className="text-lg font-semibold text-white mb-6">
          Are you sure you want to delete this product?
        </h1>
        <div className="flex justify-between">
          <button
            onClick={handleDeleteConfirm}
            className="bg-red-600 text-white p-2 rounded-lg"
          >
            Yes, Delete
          </button>
          <button
            onClick={handleDeleteCancel}
            className="bg-gray-600 text-white p-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
