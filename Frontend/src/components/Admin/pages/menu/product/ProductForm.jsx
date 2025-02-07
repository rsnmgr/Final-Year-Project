import React, { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function ProductForm({
  selectedDetail,
  handleSubmit,
  formData,
  handleChange,
  categories,
  selectedImage,
  fileInputRef,
  handleImageChange,
  handleToggleModal,
  setFormData, // ✅ Added to update units
}) {
  // Track multiple product units
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      units: selectedDetail?.units ?? [],
    }));
  }, [selectedDetail, setFormData]);

  const handleAddUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [...(prev.units || []), { size: "", price: "" }],
    }));
  };

  const handleUnitChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedUnits = [...prev.units];
      updatedUnits[index][field] = value;
      return { ...prev, units: updatedUnits }; // ✅ Update formData
    });
  };

  const handleRemoveUnit = (index) => {
    setFormData((prev) => {
      const updatedUnits = prev.units.filter((_, i) => i !== index);
      return { ...prev, units: updatedUnits };
    });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
      <div className="relative p-4 bg-gray-900 rounded-lg shadow-md max-w-xl w-full ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-white">
            {selectedDetail ? "Edit Product" : "Add Product"}
          </h1>
          <RxCross2
            title="Close"
            size={25}
            className="cursor-pointer text-white"
            onClick={handleToggleModal}
          />
        </div>

        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 h-[80vh] md:h-auto overflow-y-auto">
            <div className="space-y-1">
              {/* Name and Discount Fields */}
              {["name"].map((field) => (
                <div key={field} className="relative">
                  <label className="block text-sm font-medium text-white mb-1 capitalize">
                    {field}{" "}
                    <span
                      className={
                        field === "name" ? "text-red-500" : "text-transparent"
                      }
                    >
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full"
                    required={field === "name"}
                  />
                </div>
              ))}

              {/* Category Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full"
                  required
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {/* Units Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mt-2">
                  <label className="text-white">Units</label>
                  <button
                    type="button"
                    className="p-2 bg-green-800"
                    onClick={handleAddUnit}
                  >
                    <FaPlus size={16} />
                  </button>
                </div>

                {/* Unit Inputs */}
                <div className="h-[16vh] space-y-2  overflow-y-auto">
                  {(formData.units ?? []).map((unit, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center space-x-2"
                    >
                      <input
                        type="text"
                        className="p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full"
                        placeholder="Size"
                        value={unit.size}
                        required
                        onChange={(e) =>
                          handleUnitChange(index, "size", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        className="p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full"
                        placeholder="Price"
                        value={unit.price}
                        required
                        onChange={(e) =>
                          handleUnitChange(index, "price", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="p-2 bg-red-800"
                        onClick={() => handleRemoveUnit(index)}
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              {selectedImage && (
                <img
                  src={selectedImage || image}
                  alt="Selected"
                  className="object-cover w-full h-[30vh] rounded-md"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-2 bg-green-700 text-white w-full"
              >
                Browse Image
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-700 text-white w-full"
              >
                {selectedDetail ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
