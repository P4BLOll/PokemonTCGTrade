package com.pabloepedro.controller.response;

import com.pabloepedro.entity.enumerable.Roles;
import java.util.List;

public record LoginResponse(
        String id,
        String username,
        String password,
        List<Roles> roles
) {
}