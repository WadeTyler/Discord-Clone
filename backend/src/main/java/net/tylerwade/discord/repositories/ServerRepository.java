package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.Server;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServerRepository extends CrudRepository<Server, String> {
}
