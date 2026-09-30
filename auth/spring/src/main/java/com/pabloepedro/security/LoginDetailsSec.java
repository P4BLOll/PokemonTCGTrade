package com.pabloepedro.security;

import com.pabloepedro.entity.Login;
import com.pabloepedro.repository.LoginRepo;
import com.pabloepedro.security.dto.LogDto;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class LoginDetailsSec implements UserDetailsService {
    private final LoginRepo repo;

    public LoginDetailsSec(LoginRepo repo){
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Login login = repo.findByUsername(username);
        return new LogDto(login);
    }
}