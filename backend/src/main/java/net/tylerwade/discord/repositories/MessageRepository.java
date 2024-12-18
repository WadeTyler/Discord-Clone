package net.tylerwade.discord.repositories;

import jakarta.transaction.Transactional;
import net.tylerwade.discord.models.Message;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Integer> {

    List<Message> findByChannelID(String channelID);

    @Modifying
    @Transactional
    void deleteByChannelID(String channelID);
}
