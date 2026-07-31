import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { api } from '../lib/api'
import type { Order, OrderStatus } from '../lib/types'
import { NEXT_STATUS, STATUS_LABELS } from '../lib/types'

const ALL_STATUSES: Array<OrderStatus | ''> = [
  '',
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
  'CANCELADO',
]

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR')
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchResults, setSearchResults] = useState<Order[] | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [searchId, setSearchId] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const visibleOrders = searchResults ?? orders

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.listOrders(statusFilter || undefined)
      setOrders(response.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  function updateVisibleOrder(updated: Order) {
    setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    setSearchResults((current) =>
      current ? current.map((item) => (item.id === updated.id ? updated : item)) : current,
    )
  }

  async function handleAdvanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return

    setUpdatingId(order.id)
    try {
      const updated = await api.updateOrderStatus(order.id, next)
      updateVisibleOrder(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCancel(order: Order) {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return

    setUpdatingId(order.id)
    try {
      const updated = await api.updateOrderStatus(order.id, 'CANCELADO')
      updateVisibleOrder(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar pedido')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    setSearchError('')

    if (!searchId.trim()) {
      setSearchResults(null)
      return
    }

    const id = Number(searchId.trim())
    if (!Number.isInteger(id) || id <= 0) {
      setSearchError('Informe um ID de pedido válido')
      return
    }

    const localMatch = orders.find((order) => order.id === id)
    if (localMatch) {
      setSearchResults([localMatch])
      return
    }

    setSearching(true)
    try {
      const order = await api.getOrder(id)
      setSearchResults([order])
    } catch {
      setSearchResults([])
      setSearchError('Pedido não encontrado')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-sm text-slate-500">Acompanhe o status de todos os pedidos</p>
        </div>
        <Link
          to="/orders/new"
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Novo pedido
        </Link>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
            <label htmlFor="search-id" className="sr-only">
              Buscar pedido por ID
            </label>
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <SearchIcon />
            </span>
            <input
              id="search-id"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Buscar pedido por ID"
              value={searchId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setSearchId(value)
                setSearchError('')
                if (!value) {
                  setSearchResults(null)
                }
              }}
              className="w-full rounded-lg border-0 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-red-100"
            />
          </form>

          <div className="hidden h-8 w-px shrink-0 bg-slate-200 md:block" />

          <div className="md:w-52">
            <label htmlFor="status" className="sr-only">
              Filtrar por status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '')
                setSearchId('')
                setSearchResults(null)
                setSearchError('')
              }}
              className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-red-100"
            >
              {ALL_STATUSES.map((status) => (
                <option key={status || 'all'} value={status}>
                  {status ? STATUS_LABELS[status] : 'Todos os status'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchError && <p className="mt-2 px-1 text-xs text-red-600">{searchError}</p>}
      </section>

      {(loading || searching) && <p className="text-slate-600">Carregando pedidos...</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !searching && searchResults !== null && visibleOrders.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Nenhum pedido encontrado com esse ID.</p>
        </div>
      )}

      {!loading && !searching && searchResults === null && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Nenhum pedido encontrado.</p>
          <Link to="/orders/new" className="mt-3 inline-block text-sm font-medium text-red-600 hover:underline">
            Criar primeiro pedido
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {visibleOrders.map((order) => {
          const nextStatus = NEXT_STATUS[order.status]
          const canCancel = !['ENTREGUE', 'CANCELADO'].includes(order.status)

          return (
            <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">Pedido #{order.id}</h2>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Cliente: {order.customerName}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/orders/${order.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver detalhes
                </Link>
                {nextStatus && (
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => handleAdvanceStatus(order)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {updatingId === order.id ? 'Atualizando...' : `Avançar para ${STATUS_LABELS[nextStatus]}`}
                  </button>
                )}
                {canCancel && (
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => handleCancel(order)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
