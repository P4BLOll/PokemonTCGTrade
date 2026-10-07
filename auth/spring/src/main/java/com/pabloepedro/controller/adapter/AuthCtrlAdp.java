package com.pabloepedro.controller.adapter;

import com.pabloepedro.controller.request.AuthRequest;
import com.pabloepedro.entity.Auth;

// Adaptador: converte a requisição HTTP (AuthRequest) na entidade de domínio (Auth)
public class AuthCtrlAdp {
    private AuthCtrlAdp(){}

    // Transforma o DTO do body JSON no objeto de domínio
    public static Auth cast(AuthRequest request){
        return new Auth(request.username(), request.password());
    }
}