package com.pabloepedro.controller;

import com.pabloepedro.controller.adapter.AuthCtrlAdp;
import com.pabloepedro.controller.request.AuthRequest;
import com.pabloepedro.controller.response.AuthResponse;
import com.pabloepedro.security.TokenSec;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

// Endpoint de autenticação: valida as credenciais do piloto ou oficial e emite o token JWT com perfil/roles
@RestController
@RequestMapping("/auth")
public class AuthCtrl {
    private final TokenSec sec;

    public AuthCtrl(TokenSec sec){
        this.sec = sec;
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping({"/service/auth", "/login"})
    public AuthResponse login(@RequestBody AuthRequest request){
        TokenSec.TokenAuthDetails details = sec.gerarComDetalhes(AuthCtrlAdp.cast(request));
        return new AuthResponse(details.token(), details.username(), details.roles());
    }
}