package com.pabloepedro.security.dto;

import com.pabloepedro.entity.Login;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

// Adapta nossa entidade 'Login' para a interface 'UserDetails' exigida pelo Spring Security
public record LogDto(
        Login login
) implements UserDetails {
    // Transforma nossas roles em authorities do Spring (ex: "ROLE_ADMIN", "ROLE_USER")
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return login.roles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
    }

    // Retorna a senha criptografada do usuário
    @Override
    public String getPassword() {
        return login.password();
    }

    // Retorna o username do usuário
    @Override
    public String getUsername() {
        return login.username();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}