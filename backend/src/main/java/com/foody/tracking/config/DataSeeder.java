package com.foody.tracking.config;

import com.foody.tracking.order.*;
import com.foody.tracking.user.User;
import com.foody.tracking.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@Profile("!test")
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedData(UserRepository userRepository, OrderRepository orderRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.existsByEmail("demo@foody.com")) {
                return;
            }

            User demoUser = userRepository.save(new User(
                    "Operador Demo",
                    "demo@foody.com",
                    passwordEncoder.encode("demo1234")
            ));

            Order order1 = new Order(
                    "João Santos",
                    new DeliveryAddress("Rua das Flores", "123", "São Paulo", "01310100"),
                    demoUser
            );
            order1.addItem(new OrderItem("Pizza Margherita", 2, new BigDecimal("45.90")));
            order1.addItem(new OrderItem("Refrigerante 2L", 1, new BigDecimal("12.00")));
            orderRepository.save(order1);

            Order order2 = new Order(
                    "Ana Costa",
                    new DeliveryAddress("Av. Paulista", "1000", "São Paulo", "01310200"),
                    demoUser
            );
            order2.addItem(new OrderItem("Hambúrguer Artesanal", 1, new BigDecimal("32.50")));
            order2.updateStatus(OrderStatus.EM_PREPARO);
            orderRepository.save(order2);

            log.info("Dados demo criados: demo@foody.com / demo1234");
        };
    }
}
