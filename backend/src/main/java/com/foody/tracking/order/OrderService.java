package com.foody.tracking.order;

import com.foody.tracking.common.InvalidStatusTransitionException;
import com.foody.tracking.common.NotFoundException;
import com.foody.tracking.order.dto.CreateOrderRequest;
import com.foody.tracking.order.dto.OrderItemRequest;
import com.foody.tracking.order.dto.OrderResponse;
import com.foody.tracking.order.dto.PageResponse;
import com.foody.tracking.user.User;
import com.foody.tracking.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
public class OrderService {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = buildTransitions();

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String userEmail) {
        User user = requireUser(userEmail);

        DeliveryAddress address = new DeliveryAddress(
                request.deliveryAddress().street(),
                request.deliveryAddress().number(),
                request.deliveryAddress().city(),
                request.deliveryAddress().zipCode()
        );

        Order order = new Order(request.customerName(), address, user);
        for (OrderItemRequest itemRequest : request.items()) {
            order.addItem(new OrderItem(
                    itemRequest.name(),
                    itemRequest.quantity(),
                    itemRequest.unitPrice()
            ));
        }

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> listOrders(String userEmail, OrderStatus status, int page, int size) {
        User user = requireUser(userEmail);
        PageRequest pageable = PageRequest.of(page, size);
        Page<Order> orders = status == null
                ? orderRepository.findByCreatedBy(user, pageable)
                : orderRepository.findByCreatedByAndStatus(user, status, pageable);
        return orderMapper.toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String userEmail) {
        User user = requireUser(userEmail);
        Order order = requireOwnedOrder(id, user);
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus, String userEmail) {
        User user = requireUser(userEmail);
        Order order = requireOwnedOrder(id, user);

        validateTransition(order.getStatus(), newStatus);
        order.updateStatus(newStatus);
        return orderMapper.toResponse(order);
    }

    private User requireUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
    }

    private Order requireOwnedOrder(Long id, User user) {
        return orderRepository.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado: " + id));
    }

    public void validateTransition(OrderStatus current, OrderStatus target) {
        if (current == target) {
            return;
        }

        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(target)) {
            throw new InvalidStatusTransitionException(current, allowed);
        }
    }

    private static Map<OrderStatus, Set<OrderStatus>> buildTransitions() {
        Map<OrderStatus, Set<OrderStatus>> transitions = new EnumMap<>(OrderStatus.class);
        transitions.put(OrderStatus.RECEBIDO, EnumSet.of(OrderStatus.EM_PREPARO, OrderStatus.CANCELADO));
        transitions.put(OrderStatus.EM_PREPARO, EnumSet.of(OrderStatus.SAIU_PARA_ENTREGA, OrderStatus.CANCELADO));
        transitions.put(OrderStatus.SAIU_PARA_ENTREGA, EnumSet.of(OrderStatus.ENTREGUE, OrderStatus.CANCELADO));
        transitions.put(OrderStatus.ENTREGUE, EnumSet.noneOf(OrderStatus.class));
        transitions.put(OrderStatus.CANCELADO, EnumSet.noneOf(OrderStatus.class));
        return transitions;
    }
}
