import type { OrderStatus } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  RECEBIDO: 'bg-blue-100 text-blue-800',
  EM_PREPARO: 'bg-amber-100 text-amber-800',
  SAIU_PARA_ENTREGA: 'bg-purple-100 text-purple-800',
  ENTREGUE: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
