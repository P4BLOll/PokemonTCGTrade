package com.pabloepedro.controller.adapter;

import com.pabloepedro.controller.request.LoginRequest;
import com.pabloepedro.controller.response.LoginResponse;
import com.pabloepedro.entity.Login;

import java.util.UUID;

public class LoginCtrlAdp {
    private LoginCtrlAdp(){}

    public static Login castRequest(LoginRequest request){
        return new Login(
                UUID.randomUUID().toString(),
                request.username(),
                request.password(),
                request.roles()
        );
    }

    public static LoginResponse castResponse(Login login){
        return new LoginResponse(
                login.id(),
                login.username(),
                login.password(),
                login.roles()
        );
    }
}