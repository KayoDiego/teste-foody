package com.foody.tracking.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record OrderItemRequest(
        @NotBlank(message = "Nome do item é obrigatório")
        String name,

        @Positive(message = "Quantidade deve ser positiva")
        int quantity,

        @Positive(message = "Preço unitário deve ser positivo")
        BigDecimal unitPrice
) {
}
