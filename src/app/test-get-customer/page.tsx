'use client'

import { useState } from 'react'

export default function TestGetCustomer() {
  const [result, setResult] = useState('')
  const [customerId, setCustomerId] = useState('customer-test-001')

  const testGet = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  const testList = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">顧客取得テスト</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="border p-2 mr-2 text-gray-900"
          placeholder="顧客ID"
        />
        <button
          onClick={testGet}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          単一顧客取得
        </button>
        <button
          onClick={testList}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          顧客一覧取得
        </button>
      </div>

      <pre className="bg-gray-100 p-4 rounded text-xs text-gray-900">
        {result || '結果がここに表示されます'}
      </pre>
    </div>
  )
}
