package com.pabloepedro.controller;

import com.pabloepedro.controller.adapter.AuthCtrlAdp;
import com.pabloepedro.controller.request.AuthRequest;
import com.pabloepedro.controller.response.AuthResponse;
import com.pabloepedro.entity.Token;
import com.pabloepedro.security.TokenSec;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthCtrl {
    private final TokenSec sec;

    public AuthCtrl(TokenSec sec){
        this.sec = sec;
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/service/auth")
    public AuthResponse login(@RequestBody AuthRequest request){
        Token token = sec.gerar(AuthCtrlAdp.cast(request));
        return new AuthResponse(token.value());
    }
}