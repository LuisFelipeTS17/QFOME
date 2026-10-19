package com.qfome;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class QfomeBackendApplication {

	public static void main(String[] args) throws IOException {
		// O driver do SQLite cria o arquivo qfome.db, mas nao a pasta onde ele fica.
		Files.createDirectories(Path.of("data"));
		SpringApplication.run(QfomeBackendApplication.class, args);
	}

}
