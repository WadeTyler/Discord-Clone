package net.tylerwade.discord.repositories;

import jakarta.transaction.Transactional;
import net.tylerwade.discord.models.Message;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Integer> {

    List<Message> findByChannelID(String channelID);

    @Modifying
    @Transactional
    void deleteByChannelID(String channelID);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM messages WHERE channelID IN (SELECT channelID FROM channels WHERE serverID = ?1)", nativeQuery = true)
    void deleteByServerID(String serverID);
}
