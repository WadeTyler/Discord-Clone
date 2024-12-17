package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.Channel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelRepository extends CrudRepository<Channel, String> {
    List<Channel> findByServerID(String serverID);
}
