export function validateName(name: string, field = 'Nome'): string | null {
  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return `${field} deve ter pelo menos 2 caracteres`
  }
  if (trimmed.length > 100) {
    return `${field} deve ter no máximo 100 caracteres`
  }
  return null
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'E-mail inválido'
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Senha deve ter no mínimo 8 caracteres'
  }
  return null
}

export function validateZipCode(zipCode: string): string | null {
  if (!/^\d{8}$/.test(zipCode)) {
    return 'CEP deve conter exatamente 8 números'
  }
  return null
}

export function validateOrderForm(data: {
  customerName: string
  deliveryAddress: { street: string; number: string; city: string; zipCode: string }
  items: Array<{ name: string; quantity: number; unitPrice: number }>
}): string | null {
  const customerError = validateName(data.customerName, 'Nome do cliente')
  if (customerError) return customerError

  if (data.deliveryAddress.street.trim().length < 3) {
    return 'Rua deve ter pelo menos 3 caracteres'
  }
  if (!data.deliveryAddress.number.trim()) {
    return 'Número é obrigatório'
  }
  if (data.deliveryAddress.city.trim().length < 2) {
    return 'Cidade deve ter pelo menos 2 caracteres'
  }

  const zipError = validateZipCode(data.deliveryAddress.zipCode)
  if (zipError) return zipError

  if (data.items.length === 0) {
    return 'Adicione pelo menos um item ao pedido'
  }

  for (const item of data.items) {
    if (item.name.trim().length < 2) {
      return 'Cada item deve ter um nome com pelo menos 2 caracteres'
    }
    if (item.quantity < 1 || item.quantity > 999) {
      return 'Quantidade deve ser entre 1 e 999'
    }
    if (item.unitPrice <= 0) {
      return 'Preço unitário deve ser maior que zero'
    }
  }

  return null
}
