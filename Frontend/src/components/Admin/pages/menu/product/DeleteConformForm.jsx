
export default function DeleteConformForm({
  handleDeleteConfirm,
  handleDeleteCancel,
}) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-50 z-50">
      <div className="relative p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-sm w-full">
        <h1 className="text-lg font-semibold text-white mb-6">
          Are you sure you want to delete this product?
        </h1>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleDeleteConfirm}
            className="bg-red-600 text-white p-2 "
          >
            Delete
          </button>
          <button
            onClick={handleDeleteCancel}
            className="bg-gray-600 text-white p-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
