package com.pabloepedro.trade.repository.orm;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "binders")
public record TrainerBinderOrm(
        @Id String id,
        @Indexed(unique = true) String trainerUsername,
        List<BinderItemOrm> cards
) {
}