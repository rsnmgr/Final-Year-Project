import { Pie } from "recharts";
import Card from "./dasbhoard/card";
import Chart from "./dasbhoard/chart";
import Table from "./dasbhoard/table";
import PieChart from './dasbhoard/pie'
export default function Dashboard() {
  return (
    <div className="overflow-x-auto h-[90vh] space-y-4 p-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">My Dashboard</h1>
      </div>
      <Card />
      {/* <div >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Chart />
        <PieChart/>
        </div>
      </div> */}
      <Table/>
    </div>
  );
}
