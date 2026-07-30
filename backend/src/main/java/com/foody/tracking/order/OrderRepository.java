package com.foody.tracking.order;

import com.foody.tracking.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByCreatedBy(User createdBy, Pageable pageable);

    Page<Order> findByCreatedByAndStatus(User createdBy, OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndCreatedBy(Long id, User createdBy);
}
