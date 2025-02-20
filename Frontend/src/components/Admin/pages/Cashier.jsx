import React, { useState } from 'react';
import Table from './cashier/Table';
import BillArea from './cashier/BillArea';

export default function UserInfo() {
  const [selectedTable, setSelectedTable] = useState(null);

  return (
    <div className='flex w-full flex-col md:flex-row'>
      <div className={`w-full md:w-1/2 ${selectedTable ? 'hidden md:block' : ''}`}>
        <Table onTableSelect={setSelectedTable} />
      </div>
      <div className={`w-full md:w-1/2 ${selectedTable ? 'block' : 'hidden md:block'}`}>
        <BillArea setSelectedTable={setSelectedTable}/>
      </div>
    </div>
  );
}
