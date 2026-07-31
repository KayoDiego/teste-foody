import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { DeliveryAddress } from '../lib/types'

interface ItemForm {
  name: string
  quantity: number
  unitPrice: number
}

const emptyItem = (): ItemForm => ({ name: '', quantity: 1, unitPrice: 0 })

export function NewOrderPage() {
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState('')
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    city: '',
    zipCode: '',
  })
  const [items, setItems] = useState<ItemForm[]>([emptyItem()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  )

  function updateItem(index: number, field: keyof ItemForm, value: string | number) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()])
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const order = await api.createOrder({
        customerName,
        deliveryAddress: address,
        items: items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      })
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link to="/" className="text-sm font-medium text-red-600 hover:underline">
          ← Voltar para pedidos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Novo pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Cliente</h2>
          <input
            required
            placeholder="Nome do cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Endereço de entrega</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Rua"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500 sm:col-span-2"
            />
            <input
              required
              placeholder="Número"
              value={address.number}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              required
              placeholder="CEP"
              inputMode="numeric"
              pattern="\d{8}"
              maxLength={8}
              title="CEP deve conter 8 números"
              value={address.zipCode}
              onChange={(e) =>
                setAddress({ ...address, zipCode: e.target.value.replace(/\D/g, '').slice(0, 8) })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
            />
            <input
              required
              placeholder="Cidade"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500 sm:col-span-2"
            />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Itens</h2>
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              + Adicionar item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-4">
                <input
                  required
                  placeholder="Nome do item"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500 sm:col-span-2"
                />
                <input
                  required
                  type="number"
                  min={1}
                  placeholder="Qtd"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                />
                <div className="flex gap-2">
                  <input
                    required
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="Preço"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg border border-red-300 px-2 text-red-600 hover:bg-red-50"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-lg font-semibold text-slate-900">
            Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Criando...' : 'Criar pedido'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
