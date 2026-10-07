package com.pabloepedro.controller.adapter;

import com.pabloepedro.controller.request.LoginRequest;
import com.pabloepedro.controller.response.LoginResponse;
import com.pabloepedro.entity.Login;
import com.pabloepedro.entity.enumerable.Roles;

import java.util.List;
import java.util.UUID;

// Adaptador: converte os dados de requisição e resposta de usuário para o formato do Domínio
public class LoginCtrlAdp {
    private LoginCtrlAdp(){}

    // Pega o DTO de cadastro e cria a entidade de domínio com um novo UUID
    public static Login castRequest(LoginRequest request){
        List<Roles> roles = (request.roles() != null && !request.roles().isEmpty())
                ? request.roles()
                : List.of(Roles.USER);

        return new Login(
                UUID.randomUUID().toString(),
                request.username(),
                request.password(),
                roles
        );
    }

    // Pega a entidade de domínio do usuário e monta a resposta DTO pro frontend
    public static LoginResponse castResponse(Login login){
        return new LoginResponse(
                login.id(),
                login.username(),
                login.password(),
                login.roles()
        );
    }
}