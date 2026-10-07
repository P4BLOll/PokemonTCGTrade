package com.pabloepedro.controller;

import com.pabloepedro.controller.adapter.LoginCtrlAdp;
import com.pabloepedro.controller.request.LoginRequest;
import com.pabloepedro.controller.response.LoginResponse;
import com.pabloepedro.entity.Login;
import com.pabloepedro.repository.LoginRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller REST com as rotas de gerenciamento de usuários e oficiais
@RestController
@RequestMapping("/login")
public class LoginCtrl {

    private final LoginRepo repo;

    public LoginCtrl(LoginRepo repo){
        this.repo = repo;
    }

    // Endpoint POST /login/user/cadastrar: salva um novo usuário no MongoDB
    @PostMapping("/user/cadastrar")
    public LoginResponse salvar(@RequestBody LoginRequest request) {
        Login login = LoginCtrlAdp.castRequest(request);
        Login loginSalvo = repo.salvar(login);
        return LoginCtrlAdp.castResponse(loginSalvo);
    }

    // Endpoint GET /login/user/buscar/{id}: busca um usuário pelo ID
    @GetMapping("/user/buscar/{id}")
    public LoginResponse buscar(@PathVariable String id){
        Login login = repo.buscar(id).orElseThrow(() -> new RuntimeException("Login não encontrado"));
        return LoginCtrlAdp.castResponse(login);
    }

    // Endpoint GET /login/user/lista: lista todos os usuários cadastrados
    @GetMapping("/user/lista")
    public List<LoginResponse> listar(){
        List<Login> logins = repo.listar();
        return logins.stream().map(LoginCtrlAdp::castResponse).toList();
    }

    // Endpoint PUT /login/user/editar/{id}: altera dados de um usuário existente
    @PutMapping("/user/editar/{id}")
    public LoginResponse editar(@PathVariable String id, @RequestBody LoginRequest request){
        Login loginExist = repo.buscar(id)
                .orElseThrow(() -> new RuntimeException("Login não encontrado"));

        Login loginEdited = new Login(
                loginExist.id(),
                request.username(),
                request.password(),
                request.roles()
        );

        Login loginSalvo = repo.salvar(loginEdited);
        return LoginCtrlAdp.castResponse(loginSalvo);
    }

    // Endpoint DELETE /login/user/deletar/{id}: remove o usuário do MongoDB
    @DeleteMapping("/user/deletar/{id}")
    public void deletar(@PathVariable String id){
        repo.buscar(id).orElseThrow(() -> new RuntimeException("Login não encontrado"));
        repo.deletar(id);
    }
}