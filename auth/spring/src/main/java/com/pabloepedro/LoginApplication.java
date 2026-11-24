package com.pabloepedro;

import com.pabloepedro.controller.request.AuthRequest;
import com.pabloepedro.controller.request.LoginRequest;
import com.pabloepedro.controller.response.AuthResponse;
import com.pabloepedro.controller.response.AuthUserResponse;
import com.pabloepedro.controller.response.LoginResponse;
import com.pabloepedro.entity.Auth;
import com.pabloepedro.entity.Login;
import com.pabloepedro.entity.Token;
import com.pabloepedro.entity.enumerable.Roles;
import com.pabloepedro.repository.orm.LoginOrm;
import org.apache.coyote.AbstractProtocol;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

// Ponto de entrada (Main) do microsserviço de Autenticação e Usuários (porta 8081)
@EnableWebSecurity
@EnableMethodSecurity
@SpringBootApplication
@ImportRuntimeHints(LoginApplication.GraalVmTomcatHints.class)
@RegisterReflectionForBinding({
        Auth.class,
        Login.class,
        Token.class,
        Roles.class,
        LoginOrm.class,
        AuthRequest.class,
        LoginRequest.class,
        AuthResponse.class,
        AuthUserResponse.class,
        LoginResponse.class
})
public class LoginApplication {

    // Inicializa o servidor Spring Boot de Auth
    public static void main(String[] args) {
        SpringApplication.run(LoginApplication.class, args);
    }

    static class GraalVmTomcatHints implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            hints.reflection().registerType(AbstractProtocol.class, MemberCategory.INVOKE_PUBLIC_METHODS);
        }
    }

}
