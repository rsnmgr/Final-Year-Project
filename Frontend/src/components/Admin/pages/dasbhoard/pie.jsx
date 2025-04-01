
const data = [
  { name: "Group A", value: 400, color: "#0088FE" },
  { name: "Group B", value: 300, color: "#00C49F" },
  { name: "Group C", value: 300, color: "#FFBB28" },
  { name: "Group D", value: 200, color: "#FF8042" }
];

const PieChartComponent = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  const getPath = (value, index) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    cumulative += value;
    const endAngle = (cumulative / total) * 2 * Math.PI;

    const x1 = 200 + 120 * Math.cos(startAngle);
    const y1 = 200 + 120 * Math.sin(startAngle);
    const x2 = 200 + 120 * Math.cos(endAngle);
    const y2 = 200 + 120 * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M200,200 L${x1},${y1} A120,120 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  };

  return (
    <div className="flex justify-center items-center  border border-gray-800 rounded-md">
        <ol>
            <li>Hello</li>
            <li>Hi</li>
            <li>How</li>
            <li>are</li>
        </ol>
      <svg width={400} height={400} viewBox="0 0 400 400">
        {data.map((entry, index) => (
          <path key={index} d={getPath(entry.value, index)} fill={entry.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
};

export default PieChartComponent;