import { useState } from "react";

export default function Calculator({
  setCalculator,
  tableData,
  totalAfterDiscount,
}) {
  const [enteredAmount, setEnteredAmount] = useState(""); // State for entered amount
  const [returnAmount, setReturnAmount] = useState(""); // State for return amount

  const handleEnteredAmountChange = (e) => {
    const value = e.target.value;
    setEnteredAmount(value);

    // Calculate return amount when entered amount changes
    if (value && !isNaN(value)) {
      setReturnAmount(value - totalAfterDiscount);
    } else {
      setReturnAmount("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calculator</h1>
        <h1 className="text-xl font-bold">
          Table No: {tableData?.table?.name || "N/A"}
        </h1>
      </div>
      <div className="flex justify-between items-center space-x-4">
        <div className="space-y-2">
          <label htmlFor="">Total Amount</label>
          <input
            className="block outline-none bg-gray-800 border border-gray-500 p-1"
            type="text"
            name=""
            id=""
            value={totalAfterDiscount}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="">Enter Amount</label>
          <input
            className="block outline-none bg-gray-800 border border-gray-500 p-1"
            type="text"
            name=""
            id=""
            value={enteredAmount}
            onChange={handleEnteredAmountChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="" className="flex justify-center items-center">
          Return Amount
        </label>
        <input
          className="block outline-none w-full text-center bg-gray-800 border border-gray-500 p-1"
          type="text"
          name=""
          id=""
          value={returnAmount ? returnAmount.toFixed(2) : ""}
          readOnly
        />
      </div>
      <button
        className="w-full bg-gray-900 p-2 rounded"
        onClick={() => setCalculator(false)}
      >
        Close
      </button>
    </div>
  );
}
