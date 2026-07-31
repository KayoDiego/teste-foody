package com.foody.tracking.order.dto;

import com.foody.tracking.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Status é obrigatório")
        OrderStatus status
) {
}
