package com.pabloepedro.repository;

import com.pabloepedro.entity.Login;
import com.pabloepedro.repository.adapter.LoginRepoAdp;
import com.pabloepedro.repository.client.LoginMongo;
import com.pabloepedro.repository.orm.LoginOrm;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Implementação do repositório de login usando Spring Data MongoDB e BCrypt
@Repository
public class LoginRepoImpl implements LoginRepo {
    private final PasswordEncoder encoder;
    private final LoginMongo repo;

    public LoginRepoImpl(PasswordEncoder encoder, LoginMongo repo){
        this.encoder = encoder;
        this.repo = repo;
    }

    // Salva o usuário no MongoDB e retorna com a senha tratada
    @Override
    public Login salvar(Login login) {
        LoginOrm orm = LoginRepoAdp.castEntity(login);
        LoginOrm ormSave = repo.save(orm);
        return LoginRepoAdp.castOrm(ormSave, encoder);
    }

    // Busca usuário pelo id
    @Override
    public Optional<Login> buscar(String id) {
        Optional<LoginOrm> orm = repo.findById(id);
        if(orm.isPresent()){
            Login login = LoginRepoAdp.castOrm(orm.get(), encoder);
            return Optional.of(login);
        }
        return Optional.empty();
    }

    // Retorna todos os usuários salvos no MongoDB
    @Override
    public List<Login> listar(){
        List<LoginOrm> listaOrm = repo.findAll();
        return listaOrm.stream().map(orm -> LoginRepoAdp.castOrm(orm, encoder)).toList();
    }

    // Deleta o registro do usuário
    @Override
    public void deletar(String id){
        repo.deleteById(id);
    }

    // Busca pelo nome de usuário; se não achar, joga exceção do Spring Security
    @Override
    public Login findByUsername(String username) {
        Optional<LoginOrm> optional = repo.findByUsername(username);
        if (optional.isEmpty()) {
            throw new UsernameNotFoundException("Usuario não encontrado: " + username);
        }
        return LoginRepoAdp.castOrm(optional.get(), encoder);
    }
}