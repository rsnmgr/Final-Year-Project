import { useEffect, useState } from "react";

export default function Notification() {
  const [isChecked, setIsChecked] = useState(false);

  // Load the checkbox state from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("notificationOrder");
    if (saved === "on") {
      setIsChecked(true);
    }
  }, []);

  // Save to localStorage whenever isChecked changes
  useEffect(() => {
    localStorage.setItem("notificationOrder", isChecked ? "on" : "off");
  }, [isChecked]);

  const handleChange = () => {
    setIsChecked(prev => !prev);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <label htmlFor="notification-checkbox">Notification For Order find</label>
        <input
          id="notification-checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
