package com.foody.tracking.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Nome do cliente é obrigatório")
        @Size(min = 2, max = 120, message = "Nome do cliente deve ter entre 2 e 120 caracteres")
        String customerName,

        @Valid
        DeliveryAddressRequest deliveryAddress,

        @NotEmpty(message = "Pedido deve conter ao menos um item")
        @Valid
        List<OrderItemRequest> items
) {
}
