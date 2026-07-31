import { useCallback, useEffect, useState } from 'react'
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

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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

  async function handleAdvanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return

    setUpdatingId(order.id)
    try {
      const updated = await api.updateOrderStatus(order.id, next)
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))
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
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar pedido')
    } finally {
      setUpdatingId(null)
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

      <div className="mb-4">
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
          Filtrar por status
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
        >
          {ALL_STATUSES.map((status) => (
            <option key={status || 'all'} value={status}>
              {status ? STATUS_LABELS[status] : 'Todos os status'}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-slate-600">Carregando pedidos...</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Nenhum pedido encontrado.</p>
          <Link to="/orders/new" className="mt-3 inline-block text-sm font-medium text-red-600 hover:underline">
            Criar primeiro pedido
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order) => {
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
