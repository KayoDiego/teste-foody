package com.foody.tracking.order.dto;

import jakarta.validation.constraints.NotBlank;

public record DeliveryAddressRequest(
        @NotBlank(message = "Rua é obrigatória")
        String street,

        @NotBlank(message = "Número é obrigatório")
        String number,

        @NotBlank(message = "Cidade é obrigatória")
        String city,

        @NotBlank(message = "CEP é obrigatório")
        String zipCode
) {
}
