package com.pabloepedro.repository.adapter;

import com.pabloepedro.entity.Login;
import com.pabloepedro.repository.orm.LoginOrm;
import org.springframework.security.crypto.password.PasswordEncoder;

// Adaptador: faz o mapeamento entre a entidade de domínio e o documento ORM do MongoDB
public class LoginRepoAdp {
    private LoginRepoAdp(){
    }

    // Converte o documento salvo no banco para a entidade de domínio
    public static Login castOrm(LoginOrm orm, PasswordEncoder passwordEncoder){
        return new Login(
                orm.id(),
                orm.username(),
                passwordEncoder.encode(orm.password()),
                orm.roles()
        );
    }

    // Converte a entidade de domínio para o documento a ser persistido no MongoDB
    public static LoginOrm castEntity(Login login){
        return new LoginOrm(
                login.id(),
                login.username(),
                login.password(),
                login.roles()
        );
    }
}