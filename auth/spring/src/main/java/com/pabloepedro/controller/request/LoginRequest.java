package com.pabloepedro.controller.request;

import com.pabloepedro.entity.enumerable.Roles;
import java.util.List;

public record LoginRequest(
        String username,
        String password,
        List<Roles> roles
) {
}