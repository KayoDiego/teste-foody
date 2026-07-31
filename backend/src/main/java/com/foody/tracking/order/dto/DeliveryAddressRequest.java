package com.foody.tracking.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeliveryAddressRequest(
        @NotBlank(message = "Rua é obrigatória")
        @Size(min = 3, max = 120, message = "Rua deve ter entre 3 e 120 caracteres")
        String street,

        @NotBlank(message = "Número é obrigatório")
        @Size(max = 20, message = "Número deve ter no máximo 20 caracteres")
        String number,

        @NotBlank(message = "Cidade é obrigatória")
        @Size(min = 2, max = 80, message = "Cidade deve ter entre 2 e 80 caracteres")
        String city,

        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{8}", message = "CEP deve conter exatamente 8 números")
        String zipCode
) {
}
