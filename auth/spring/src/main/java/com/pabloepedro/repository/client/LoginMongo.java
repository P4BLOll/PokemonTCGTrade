package com.pabloepedro.repository.client;

import com.pabloepedro.repository.orm.LoginOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginMongo extends MongoRepository<LoginOrm, String> {
    Optional<LoginOrm> findByUsername(String username);
}