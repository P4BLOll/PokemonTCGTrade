package com.pabloepedro.repository.orm;

import com.pabloepedro.entity.enumerable.Roles;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "login")
public record LoginOrm(
        @Id String id,
        String username,
        String password,
        List<Roles> roles
) {
}