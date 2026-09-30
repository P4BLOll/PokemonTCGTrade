package com.pabloepedro.repository.adapter;

import com.pabloepedro.entity.Login;
import com.pabloepedro.repository.orm.LoginOrm;
import org.springframework.security.crypto.password.PasswordEncoder;

public class LoginRepoAdp {
    private LoginRepoAdp(){
    }

    public static Login castOrm(LoginOrm orm, PasswordEncoder passwordEncoder){
        return new Login(
                orm.id(),
                orm.username(),
                passwordEncoder.encode(orm.password()),
                orm.roles()
        );
    }

    public static LoginOrm castEntity(Login login){
        return new LoginOrm(
                login.id(),
                login.username(),
                login.password(),
                login.roles()
        );
    }
}