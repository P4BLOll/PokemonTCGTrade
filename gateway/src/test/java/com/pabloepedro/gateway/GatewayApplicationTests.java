package com.pabloepedro.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Teste básico que valida se o contexto do Spring Cloud Gateway sobe sem erros de configuração
@SpringBootTest
class GatewayApplicationTests {

	// Verifica se todas as rotas e beans do gateway carregaram perfeitamente
	@Test
	void contextLoads() {
	}

}

