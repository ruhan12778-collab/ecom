'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pages')
      const data = await res.json()
      setPages(data.data || data.pages || [])
    } catch (err) {
      console.error('Failed to fetch pages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return
    try {
      await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
      fetchPages()
    } catch (err) {
      console.error('Failed to delete page:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-stone-900">Pages</h2>
        <Link href="/admin/pages/new" className="btn btn-primary">
          Create Page
        </Link>
      </div>

      {loading ? (
        <div className="text-stone-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Published</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Updated</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-stone-900 font-medium">{p.title}</td>
                  <td className="px-6 py-4 text-sm text-stone-500">{p.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${p.isPublished ? 'bg-green-500' : 'bg-stone-300'}`} />
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Link href={`/admin/pages/${p.id}/edit`} className="text-accent-teal hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-stone-400">No pages found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
