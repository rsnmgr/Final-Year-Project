import { useState } from 'react';

export default function Chart() {
  // Sample data for the chart (Sales amounts for each day of the week)
  const data = [120, 200, 150, 180, 220, 90, 250,120, 200, 150, 180, 220, 90, 250];

  // Weekdays for the X-axis
  const xLabels = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // State to hold the currently hovered bar's value for tooltip display
  const [hoveredValue, setHoveredValue] = useState(null);

  return (
    <div className="border border-gray-800   rounded-md p-6">
      <div className='space-y-6' >
       <div>
        <h1>Bar Chart For Sales</h1>
        <p>hellow My name is Roshan</p>
       </div>
        {/* Bar Chart */}
        <div className="flex justify-between items-end h-48  relative border-b border-gray-600">
          {data.map((value, index) => (
            <div
              key={index}
              className="bg-green-700 w-8 rounded-t-md relative"
              style={{
                height: `${(value / 250) * 100}%`,
                transition: 'height 0.3s ease-in-out',
              }}
              onMouseEnter={() => setHoveredValue(value)}
              onMouseLeave={() => setHoveredValue(null)}
            >
              {/* Tooltip */}
              {hoveredValue === value && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black p-1 rounded">
                  ${value}
                </div>
              )}

              {/* X-Axis Labels inside the Bar */}
              <div className="absolute bottom-[-20px] left-0 w-full flex justify-center">
                <span className="text-sm text-white">{xLabels[index]}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h1>hELLOW I AM ROSHAN</h1>
          <p>
            This is a simple bar chart component built with React and Tailwind
            
          </p>
        </div>
      </div>
    </div>
  );
}
