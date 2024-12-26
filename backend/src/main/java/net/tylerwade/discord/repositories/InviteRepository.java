package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.Invite;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InviteRepository extends CrudRepository<Invite, String> {

}