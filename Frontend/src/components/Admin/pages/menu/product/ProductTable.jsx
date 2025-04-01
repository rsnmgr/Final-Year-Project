import { MdDelete, MdModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
export default function ProductTable({
  searchTerm,
  details,
  handleToggleModal,
  handleDeleteClick,
  categoryNames,
  setSearchTerm,
  units,
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  //  console.log(categoryNames)
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-800 outline-none rounded-lg"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="p-2 bg-gray-900 text-white border border-gray-800 w-auto"
          title="Detail Add"
          onClick={() => handleToggleModal()}
        >
          <FaPlus />
        </button>
      </div>

      <div className="overflow-x-auto h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {[
                "SN",
                "Name",
                "Category",
                "Units",
                "Image",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {details.filter((detail) =>
              detail.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length > 0 ? (
              details
                .filter((detail) =>
                  detail.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((detail, index) => (
                  <tr key={detail._id} className="text-slate-200">
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      {detail.name}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      {categoryNames[detail.category] || "Loading..."}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      {detail.units && detail.units.length > 0
                        ? detail.units
                            .map((unit) => {
                              const matchedUnit = units.find(
                                (u) => u._id === unit.size
                              );
                              return matchedUnit
                                ? matchedUnit.name
                                : "Unknown Unit";
                            })
                            .join(", ")
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      <img
                        src={`${API_URL}/${detail.image}` }
                        alt="Detail"
                        className="w-8 h-8 rounded-md object-cover mx-auto"
                      />
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                      {detail.status}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                      <MdModeEdit
                        className="text-2xl text-green-800 cursor-pointer"
                        title="Edit"
                        onClick={() => handleToggleModal(detail)}
                      />
                      <MdDelete
                        title="Delete"
                        className="text-2xl text-red-800 cursor-pointer"
                        onClick={() => handleDeleteClick(detail)}
                      />
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-4 text-center text-sm text-gray-100"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
