package com.foody.tracking.order.dto;

import com.foody.tracking.order.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.Valid;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Nome do cliente é obrigatório")
        String customerName,

        @Valid
        DeliveryAddressRequest deliveryAddress,

        @NotEmpty(message = "Pedido deve conter ao menos um item")
        @Valid
        List<OrderItemRequest> items
) {
}
