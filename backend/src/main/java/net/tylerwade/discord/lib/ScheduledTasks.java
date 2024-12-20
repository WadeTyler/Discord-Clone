package net.tylerwade.discord.lib;

import net.tylerwade.discord.DiscordApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


@Component
public class ScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

    // Output how many connected users every 30 seconds
    @Scheduled(fixedRate = 30000)
    public void reportConnectedUserCount() {
        log.info("Connected Users: {}", DiscordApplication.connectedUsers.size());
    }


}
