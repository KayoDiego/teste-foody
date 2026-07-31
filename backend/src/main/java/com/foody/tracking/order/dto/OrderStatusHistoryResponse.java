package com.foody.tracking.order.dto;

import com.foody.tracking.order.OrderStatus;

import java.time.Instant;

public record OrderStatusHistoryResponse(
        OrderStatus fromStatus,
        OrderStatus toStatus,
        Instant changedAt
) {
}
