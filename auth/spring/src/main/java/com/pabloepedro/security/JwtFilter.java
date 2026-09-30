package com.pabloepedro.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter {
    private final JwtSec jwt;
    private final UserDetailsService service;

    public JwtFilter(JwtSec jwt, UserDetailsService service){
        this.jwt = jwt;
        this.service = service;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filter
    ) throws ServletException, IOException{
        String header = request.getHeader("Authorization");
        if(header != null && header.startsWith("Bearer ")){
            String token = header.substring(7);
            String username = jwt.getUsername(token);

            if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){
                UserDetails details = service.loadUserByUsername(username);
                if(jwt.isTokenValid(token, details)){
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            details, null, details.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        filter.doFilter(request, response);
    }
}