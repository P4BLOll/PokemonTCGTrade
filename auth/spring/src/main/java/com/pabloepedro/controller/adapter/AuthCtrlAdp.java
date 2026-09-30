package com.pabloepedro.controller.adapter;

import com.pabloepedro.controller.request.AuthRequest;
import com.pabloepedro.entity.Auth;

public class AuthCtrlAdp {
    private AuthCtrlAdp(){}

    public static Auth cast(AuthRequest request){
        return new Auth(request.username(), request.password());
    }
}