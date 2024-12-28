package net.tylerwade.discord;

import net.tylerwade.discord.models.User;
import net.tylerwade.discord.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.ArrayList;
import java.util.HashMap;

@SpringBootApplication
@EnableScheduling
public class DiscordApplication {

	public static HashMap<String, User> connectedUsers = new HashMap<String, User>();

	public static void main(String[] args) {
		SpringApplication.run(DiscordApplication.class, args);
		System.out.println("Backend Server is now running.");
	}

}
