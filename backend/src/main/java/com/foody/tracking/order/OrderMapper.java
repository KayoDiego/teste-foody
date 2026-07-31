package com.foody.tracking.order;

import com.foody.tracking.order.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getStatus(),
                order.getTotal(),
                toAddressResponse(order.getDeliveryAddress()),
                order.getItems().stream().map(this::toItemResponse).toList(),
                order.getStatusHistory().stream().map(this::toHistoryResponse).toList(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public PageResponse<OrderResponse> toPageResponse(org.springframework.data.domain.Page<Order> page) {
        List<OrderResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(
                content,
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    private DeliveryAddressResponse toAddressResponse(DeliveryAddress address) {
        return new DeliveryAddressResponse(
                address.getStreet(),
                address.getNumber(),
                address.getCity(),
                address.getZipCode()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }

    private OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
        return new OrderStatusHistoryResponse(
                history.getFromStatus(),
                history.getToStatus(),
                history.getChangedAt()
        );
    }
}
