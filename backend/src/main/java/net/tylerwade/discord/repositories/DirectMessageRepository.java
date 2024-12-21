package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.DirectMessage;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectMessageRepository extends CrudRepository<DirectMessage, Integer> {
}
