import { RxCross2 } from "react-icons/rx";
import { IoLogoTableau } from "react-icons/io5";

export default function Notification({ setNotification }) {
  return (
    <div>
      <div className="flex justify-between items-center p-2 px-4  border-b border-gray-600">
        <h1>Notification</h1>
        <RxCross2
          size={20}
          className="cursor-pointer"
          onClick={() => setNotification(false)}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Example Notification Item */}
        <div className="flex px-4 space-x-3 border-b border-gray-600 py-2 hover:bg-gray-800 cursor-pointer">
          <IoLogoTableau size={20} />
          <div className="text-sm text-gray-300">
            <p className="leading-tight mb-0.5">
              A New table order (Table T1) has been placed
            </p>
            <span className="text-[12px] text-gray-400 block -mt-0.5">
              March 10, 2025 at 10:37 AM
            </span>
          </div>
        </div>
        {/* Add more notifications here */}
      </div>
    </div>
  );
}
