'use client'

import { useEffect, useState } from 'react'

const STATUS_TABS = ['All', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-stone-100 text-stone-600',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' })
      if (status !== 'All') params.set('status', status)
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      setOrders(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [page, status])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Orders</h2>
        <p className="text-sm text-stone-500 mt-0.5">{total} total orders</p>
      </div>

      <div className="flex gap-1 bg-stone-100 rounded-lg p-0.5 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatus(tab); setPage(1) }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              status === tab
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm">Loading orders...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Items</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Payment</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-stone-900 font-mono">#{order.orderNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm text-stone-900">{order.user?.name || 'N/A'}</p>
                        <p className="text-xs text-stone-400">{order.user?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-600 tabular-nums">
                      {order._count?.items || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium text-stone-900 tabular-nums">
                      {`£${Number(order.total).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-stone-500 capitalize">
                      {order.paymentMethod || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-stone-400">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-stone-400">
                Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-stone-500">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
