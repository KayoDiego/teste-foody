package com.foody.tracking.order;

import com.foody.tracking.common.InvalidStatusTransitionException;
import com.foody.tracking.order.dto.CreateOrderRequest;
import com.foody.tracking.order.dto.DeliveryAddressRequest;
import com.foody.tracking.order.dto.OrderItemRequest;
import com.foody.tracking.order.dto.OrderResponse;
import com.foody.tracking.user.User;
import com.foody.tracking.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderService orderService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("Demo", "demo@foody.com", "hash");
    }

    @Test
    void shouldAllowValidTransitions() {
        orderService.validateTransition(OrderStatus.RECEBIDO, OrderStatus.EM_PREPARO);
        orderService.validateTransition(OrderStatus.EM_PREPARO, OrderStatus.SAIU_PARA_ENTREGA);
        orderService.validateTransition(OrderStatus.SAIU_PARA_ENTREGA, OrderStatus.ENTREGUE);
        orderService.validateTransition(OrderStatus.RECEBIDO, OrderStatus.CANCELADO);
    }

    @Test
    void shouldRejectInvalidTransitionFromEntregue() {
        assertThatThrownBy(() -> orderService.validateTransition(OrderStatus.ENTREGUE, OrderStatus.EM_PREPARO))
                .isInstanceOf(InvalidStatusTransitionException.class);
    }

    @Test
    void shouldRejectInvalidTransitionFromCancelado() {
        assertThatThrownBy(() -> orderService.validateTransition(OrderStatus.CANCELADO, OrderStatus.RECEBIDO))
                .isInstanceOf(InvalidStatusTransitionException.class);
    }

    @Test
    void shouldCreateOrderWithRecebidoStatus() {
        CreateOrderRequest request = new CreateOrderRequest(
                "Cliente Teste",
                new DeliveryAddressRequest("Rua A", "10", "São Paulo", "01000-000"),
                List.of(new OrderItemRequest("Pizza", 1, new BigDecimal("30.00")))
        );

        when(userRepository.findByEmail("demo@foody.com")).thenReturn(Optional.of(user));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            return order;
        });
        when(orderMapper.toResponse(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            return new OrderResponse(
                    1L,
                    order.getCustomerName(),
                    order.getStatus(),
                    order.getTotal(),
                    null,
                    List.of(),
                    List.of(),
                    order.getCreatedAt(),
                    order.getUpdatedAt()
            );
        });

        OrderResponse response = orderService.createOrder(request, "demo@foody.com");

        assertThat(response.status()).isEqualTo(OrderStatus.RECEBIDO);
        assertThat(response.customerName()).isEqualTo("Cliente Teste");
    }

    @Test
    void shouldUpdateStatusWhenTransitionIsValid() {
        Order order = new Order(
                "Cliente",
                new DeliveryAddress("Rua B", "20", "Rio", "20000-000"),
                user
        );

        when(userRepository.findByEmail("demo@foody.com")).thenReturn(Optional.of(user));
        when(orderRepository.findByIdAndCreatedBy(1L, user)).thenReturn(Optional.of(order));
        when(orderMapper.toResponse(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            return new OrderResponse(
                    1L,
                    saved.getCustomerName(),
                    saved.getStatus(),
                    saved.getTotal(),
                    null,
                    List.of(),
                    List.of(),
                    saved.getCreatedAt(),
                    saved.getUpdatedAt()
            );
        });

        OrderResponse response = orderService.updateStatus(1L, OrderStatus.EM_PREPARO, "demo@foody.com");

        assertThat(response.status()).isEqualTo(OrderStatus.EM_PREPARO);
    }
}
