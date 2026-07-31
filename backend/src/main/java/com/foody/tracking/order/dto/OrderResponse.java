package com.foody.tracking.order.dto;

import com.foody.tracking.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        OrderStatus status,
        BigDecimal total,
        DeliveryAddressResponse deliveryAddress,
        List<OrderItemResponse> items,
        List<OrderStatusHistoryResponse> statusHistory,
        Instant createdAt,
        Instant updatedAt
) {
}
