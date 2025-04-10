import {useState, useEffect} from 'react'
import {v4 as uuidv4} from 'uuid'
import CryptoJs from 'crypto-js'
export default function Payment() {
  return (
    <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
        <input type="hidden" name="amount" value="100" />
        <input type="hidden" name="tax_amount" value="0" />
        <input type="hidden" name="total_amount" value="100" />
        <input type="hidden" name="transaction_uuid" value="txn123456" />
        <input type="hidden" name="product_code" value="EPAYTEST" />
        <input type="hidden" name="product_service_charge" value="0" />
        <input type="hidden" name="product_delivery_charge" value="0" />
        <input type="hidden" name="success_url" value="https://yourdomain.com/success" />
        <input type="hidden" name="failure_url" value="https://yourdomain.com/failure" />
        <button type="submit">Pay with eSewa</button>
    </form>

  )
}
