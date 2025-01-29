import React from 'react'
import Table from './cashier/Table';
import BillArea from './cashier/BillArea';
export default function UserInfo() {
  return (
    <div className='flex w-full'>
      <div className='w-1/2'>
        <Table />
      </div>
      <div className='w-1/2'>
        <BillArea />
      </div>
    </div>
  )
}
