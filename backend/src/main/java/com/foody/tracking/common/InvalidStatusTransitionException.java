package com.foody.tracking.common;

import com.foody.tracking.order.OrderStatus;

import java.util.Set;

public class InvalidStatusTransitionException extends RuntimeException {

    private final OrderStatus currentStatus;
    private final Set<OrderStatus> allowedStatuses;

    public InvalidStatusTransitionException(OrderStatus currentStatus, Set<OrderStatus> allowedStatuses) {
        super("Transição inválida de " + currentStatus + ". Status permitidos: " + allowedStatuses);
        this.currentStatus = currentStatus;
        this.allowedStatuses = allowedStatuses;
    }

    public OrderStatus getCurrentStatus() {
        return currentStatus;
    }

    public Set<OrderStatus> getAllowedStatuses() {
        return allowedStatuses;
    }
}
