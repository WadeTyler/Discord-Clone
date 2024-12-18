package net.tylerwade.discord;

import net.tylerwade.discord.models.User;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.ArrayList;
import java.util.HashMap;

@SpringBootApplication
public class DiscordApplication {

	public static HashMap<String, User> connectedUsers = new HashMap<String, User>();

	public static void main(String[] args) {
		SpringApplication.run(DiscordApplication.class, args);
	}

}
