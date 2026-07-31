export type OrderStatus =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO'

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  expiresIn: number
  user: User
}

export interface DeliveryAddress {
  street: string
  number: string
  city: string
  zipCode: string
}

export interface OrderItem {
  id?: number
  name: string
  quantity: number
  unitPrice: number
  subtotal?: number
}

export interface OrderStatusHistory {
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedAt: string
}

export interface Order {
  id: number
  customerName: string
  status: OrderStatus
  total: number
  deliveryAddress: DeliveryAddress
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export interface CreateOrderRequest {
  customerName: string
  deliveryAddress: DeliveryAddress
  items: Array<{ name: string; quantity: number; unitPrice: number }>
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEBIDO: 'EM_PREPARO',
  EM_PREPARO: 'SAIU_PARA_ENTREGA',
  SAIU_PARA_ENTREGA: 'ENTREGUE',
}
