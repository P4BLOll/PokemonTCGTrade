package com.pabloepedro.security;

import com.pabloepedro.entity.Auth;
import com.pabloepedro.entity.Token;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
public class TokenSec {
    private final JwtSec sec;
    private final UserDetailsService services;
    private final AuthenticationManager authMan;

    public TokenSec(
            JwtSec sec,
            UserDetailsService services,
            AuthenticationManager authMan
    ){
        this.sec = sec;
        this.services = services;
        this.authMan = authMan;
    }

    public Token gerar(Auth auth){
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                auth.username(), auth.password());
        authMan.authenticate(authToken);
        UserDetails user = services.loadUserByUsername(auth.username());
        return new Token(sec.genToken(user));
    }
}