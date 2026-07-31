import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { api } from '../lib/api'
import type { Order, OrderStatus } from '../lib/types'
import { NEXT_STATUS, STATUS_LABELS } from '../lib/types'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR')
}

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const loadOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getOrder(orderId)
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedido')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!Number.isNaN(orderId)) {
      loadOrder()
    }
  }, [loadOrder, orderId])

  async function updateStatus(status: OrderStatus) {
    if (!order) return
    setUpdating(true)
    setError('')
    try {
      const updated = await api.updateOrderStatus(order.id, status)
      setOrder(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <p className="text-slate-600">Carregando pedido...</p>
  }

  if (error && !order) {
    return (
      <div>
        <Link to="/" className="text-sm font-medium text-red-600 hover:underline">
          ← Voltar
        </Link>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const nextStatus = NEXT_STATUS[order.status]
  const canCancel = !['ENTREGUE', 'CANCELADO'].includes(order.status)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link to="/" className="text-sm font-medium text-red-600 hover:underline">
          ← Voltar para pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Pedido #{order.id}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-sm text-slate-500">Criado em {formatDate(order.createdAt)}</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Informações</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Cliente</dt>
            <dd className="font-medium text-slate-900">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(order.total)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Endereço</dt>
            <dd className="font-medium text-slate-900">
              {order.deliveryAddress.street}, {order.deliveryAddress.number} — {order.deliveryAddress.city},{' '}
              {order.deliveryAddress.zipCode}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Itens</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id ?? item.name} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-slate-500">
                  {item.quantity}x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(item.subtotal ?? item.quantity * item.unitPrice)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Histórico de status</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-red-200 pl-4">
          {order.statusHistory.map((entry, index) => (
            <li key={`${entry.changedAt}-${index}`} className="relative">
              <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full bg-red-500" />
              <p className="text-sm font-medium text-slate-900">
                {entry.fromStatus ? `${STATUS_LABELS[entry.fromStatus]} → ` : ''}
                {STATUS_LABELS[entry.toStatus]}
              </p>
              <p className="text-xs text-slate-500">{formatDate(entry.changedAt)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-wrap gap-2">
        {nextStatus && (
          <button
            type="button"
            disabled={updating}
            onClick={() => updateStatus(nextStatus)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {updating ? 'Atualizando...' : `Avançar para ${STATUS_LABELS[nextStatus]}`}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={updating}
            onClick={() => updateStatus('CANCELADO')}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Cancelar pedido
          </button>
        )}
      </section>
    </div>
  )
}
