package com.pabloepedro.security;

import com.pabloepedro.entity.Login;
import com.pabloepedro.repository.LoginRepo;
import com.pabloepedro.security.dto.LogDto;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

// Implementa a interface do Spring Security para carregar os dados do usuário a partir do banco
@Component
public class LoginDetailsSec implements UserDetailsService {
    private final LoginRepo repo;

    public LoginDetailsSec(LoginRepo repo){
        this.repo = repo;
    }

    // Busca o usuário no MongoDB e empacota num UserDetails compreendido pelo Spring Security
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Login login = repo.findByUsername(username);
        return new LogDto(login);
    }
}