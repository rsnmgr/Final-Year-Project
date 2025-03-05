import React from 'react';

export default function Preparing() {
  return (
    <div className="p-4 h-[70vh] ">
      <div className="grid  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto">
        <div className="bg-gray-900 p-2 border border-gray-800 rounded-lg shadow-lg">
          <div className="flex justify-between items-center bg-gray-900 p-3 border-b-2 border-gray-500">
            <h1 className="text-white font-semibold">Table: T1</h1>
            <p className="text-gray-400 text-sm">12:45 AM</p>
          </div>
          <div className="overflow-auto max-h-56">
            <table className="w-full text-sm text-white">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                  <th className="flex-1 text-left">Item</th>
                  <th className="flex-1 text-center">Quantity</th>
                  <th className="flex-1 text-right">Units</th>
                </tr>
              </thead>
              <tbody className="block h-40 overflow-y-auto">
                <tr className="flex justify-between px-3 py-2 border-b border-gray-800">
                  <td className="flex-1 text-left">Item 1</td>
                  <td className="flex-1 text-center">2</td>
                  <td className="flex-1 text-right">Small</td>
                </tr>
                <tr className="flex justify-between px-3 py-2 border-b border-gray-800">
                  <td className="flex-1 text-left">Item 2</td>
                  <td className="flex-1 text-center">1</td>
                  <td className="flex-1 text-right">Medium</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center bg-gray-900 gap-2 border-t border-gray-500 p-2">
            <button className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-md transition-all">Cancel Order</button>
            <button className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-md transition-all">Complete</button>
          </div>
        </div>
      </div>
    </div>
  );
}