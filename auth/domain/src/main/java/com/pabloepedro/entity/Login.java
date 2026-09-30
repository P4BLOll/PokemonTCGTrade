package com.pabloepedro.entity;

import com.pabloepedro.entity.enumerable.Roles;

import java.util.List;

public record Login(
        String id,
        String username,
        String password,
        List<Roles> roles
) {
}