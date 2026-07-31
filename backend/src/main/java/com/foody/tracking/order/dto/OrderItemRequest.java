package com.foody.tracking.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record OrderItemRequest(
        @NotBlank(message = "Nome do item é obrigatório")
        @Size(min = 2, max = 100, message = "Nome do item deve ter entre 2 e 100 caracteres")
        String name,

        @Positive(message = "Quantidade deve ser positiva")
        @Max(value = 999, message = "Quantidade máxima é 999")
        int quantity,

        @Positive(message = "Preço unitário deve ser positivo")
        @DecimalMin(value = "0.01", message = "Preço unitário mínimo é R$ 0,01")
        BigDecimal unitPrice
) {
}
