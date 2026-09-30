package com.pabloepedro.config;

import com.pabloepedro.security.JwtFilter;
import com.pabloepedro.security.JwtSec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecConfig {

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager(
            HttpSecurity httpSecurity,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService
    ) throws Exception {
        AuthenticationManagerBuilder builder = httpSecurity.getSharedObject(AuthenticationManagerBuilder.class);
        builder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
        return builder.build();
    }

    @Bean
    public SecurityFilterChain filter(
            JwtSec jwt,
            HttpSecurity http,
            UserDetailsService usrDetails
    ) throws Exception {
        JwtFilter filter = new JwtFilter(jwt, usrDetails);

        http.cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/service/auth", "/login/user/cadastrar/**", "/login/user/lista").permitAll()
                        .anyRequest()
                        .authenticated())
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}