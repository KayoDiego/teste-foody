package com.foody.tracking.order.dto;

public record DeliveryAddressResponse(
        String street,
        String number,
        String city,
        String zipCode
) {
}
