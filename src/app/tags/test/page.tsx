'use client'

import { useState } from 'react'

export default function TagsTestPage() {
  const [results, setResults] = useState('')
  const [tagName, setTagName] = useState('')
  const [updateTagId, setUpdateTagId] = useState('')
  const [updateTagName, setUpdateTagName] = useState('')
  const [deleteTagId, setDeleteTagId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [tagIds, setTagIds] = useState('')

  const logResult = (operation: string, result: any) => {
    const timestamp = new Date().toLocaleTimeString()
    const resultText = `[${timestamp}] ${operation}:\n${JSON.stringify(result, null, 2)}\n\n`
    setResults(prev => resultText + prev)
  }

  // タグ一覧取得
  const getAllTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const result = await response.json()
      logResult('GET /api/tags', { status: response.status, ...result })
    } catch (error) {
      logResult('GET /api/tags ERROR', error)
    }
  }

  // タグ作成
  const createTag = async () => {
    if (!tagName.trim()) return
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim() })
      })
      const result = await response.json()
      logResult('POST /api/tags', { status: response.status, ...result })
      if (response.ok) setTagName('')
    } catch (error) {
      logResult('POST /api/tags ERROR', error)
    }
  }

  // 単一タグ取得
  const getTag = async () => {
    if (!updateTagId.trim()) return
    try {
      const response = await fetch(`/api/tags/${updateTagId}`)
      const result = await response.json()
      logResult(`GET /api/tags/${updateTagId}`, { status: response.status, ...result })
    } catch (error) {
      logResult(`GET /api/tags/${updateTagId} ERROR`, error)
    }
  }

  // タグ更新
  const updateTag = async () => {
    if (!updateTagId.trim() || !updateTagName.trim()) return
    try {
      const response = await fetch(`/api/tags/${updateTagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updateTagName.trim() })
      })
      const result = await response.json()
      logResult(`PUT /api/tags/${updateTagId}`, { status: response.status, ...result })
      if (response.ok) {
        setUpdateTagName('')
      }
    } catch (error) {
      logResult(`PUT /api/tags/${updateTagId} ERROR`, error)
    }
  }

  // タグ削除
  const deleteTag = async () => {
    if (!deleteTagId.trim()) return
    try {
      const response = await fetch(`/api/tags/${deleteTagId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      logResult(`DELETE /api/tags/${deleteTagId}`, { status: response.status, ...result })
      if (response.ok) setDeleteTagId('')
    } catch (error) {
      logResult(`DELETE /api/tags/${deleteTagId} ERROR`, error)
    }
  }

  // タグ統計取得
  const getTagStats = async () => {
    try {
      const response = await fetch('/api/tags/stats')
      const result = await response.json()
      logResult('GET /api/tags/stats', { status: response.status, ...result })
    } catch (error) {
      logResult('GET /api/tags/stats ERROR', error)
    }
  }

  // 顧客タグ取得
  const getCustomerTags = async () => {
    if (!customerId.trim()) return
    try {
      const response = await fetch(`/api/customers/${customerId}/tags`)
      const result = await response.json()
      logResult(`GET /api/customers/${customerId}/tags`, { status: response.status, ...result })
    } catch (error) {
      logResult(`GET /api/customers/${customerId}/tags ERROR`, error)
    }
  }

  // 顧客タグ設定（完全置換）
  const setCustomerTags = async () => {
    if (!customerId.trim()) return
    const tagIdArray = tagIds.split(',').map(id => id.trim()).filter(id => id)
    try {
      const response = await fetch(`/api/customers/${customerId}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds: tagIdArray })
      })
      const result = await response.json()
      logResult(`PUT /api/customers/${customerId}/tags`, { status: response.status, ...result })
    } catch (error) {
      logResult(`PUT /api/customers/${customerId}/tags ERROR`, error)
    }
  }

  // 顧客タグ追加
  const addCustomerTags = async () => {
    if (!customerId.trim()) return
    const tagIdArray = tagIds.split(',').map(id => id.trim()).filter(id => id)
    try {
      const response = await fetch(`/api/customers/${customerId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds: tagIdArray })
      })
      const result = await response.json()
      logResult(`POST /api/customers/${customerId}/tags`, { status: response.status, ...result })
    } catch (error) {
      logResult(`POST /api/customers/${customerId}/tags ERROR`, error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">タグ管理API テストページ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* タグCRUD操作 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">タグCRUD操作</h2>
            
            {/* タグ一覧取得 */}
            <div className="mb-4">
              <button
                onClick={getAllTags}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                全タグ取得
              </button>
            </div>

            {/* タグ作成 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="タグ名"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
                <button
                  onClick={createTag}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  作成
                </button>
              </div>
            </div>

            {/* タグ取得・更新 */}
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="タグID"
                  value={updateTagId}
                  onChange={(e) => setUpdateTagId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
                <button
                  onClick={getTag}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  取得
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="新しいタグ名"
                  value={updateTagName}
                  onChange={(e) => setUpdateTagName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
                <button
                  onClick={updateTag}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                >
                  更新
                </button>
              </div>
            </div>

            {/* タグ削除 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="削除するタグID"
                  value={deleteTagId}
                  onChange={(e) => setDeleteTagId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
                <button
                  onClick={deleteTag}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  削除
                </button>
              </div>
            </div>

            {/* タグ統計 */}
            <div>
              <button
                onClick={getTagStats}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                タグ統計取得
              </button>
            </div>
          </div>

          {/* 顧客タグ操作 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">顧客タグ操作</h2>
            
            {/* 顧客ID入力 */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="顧客ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              />
            </div>

            {/* タグID入力 */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="タグID（カンマ区切り）"
                value={tagIds}
                onChange={(e) => setTagIds(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-1">
                複数のタグIDをカンマで区切って入力
              </p>
            </div>

            {/* 顧客タグ取得 */}
            <div className="mb-4">
              <button
                onClick={getCustomerTags}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                顧客のタグ取得
              </button>
            </div>

            {/* 顧客タグ設定 */}
            <div className="mb-4">
              <button
                onClick={setCustomerTags}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full"
              >
                タグ設定（完全置換）
              </button>
            </div>

            {/* 顧客タグ追加 */}
            <div>
              <button
                onClick={addCustomerTags}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                タグ追加
              </button>
            </div>
          </div>
        </div>

        {/* テスト用サンプルデータ */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">テスト用サンプル</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">顧客ID例</h3>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                customer-test-001<br/>
                customer-test-002<br/>
                customer-test-003
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">操作例</h3>
              <ul className="text-gray-600 space-y-1">
                <li>1. 「全タグ取得」でタグ一覧確認</li>
                <li>2. 新しいタグを作成</li>
                <li>3. 顧客にタグを設定/追加</li>
                <li>4. タグ統計で使用状況確認</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 結果表示エリア */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">実行結果</h2>
            <button
              onClick={() => setResults('')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              クリア
            </button>
          </div>
          <div className="p-4">
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96 text-gray-900">
              {results || 'テスト実行結果がここに表示されます...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}