package net.tylerwade.discord.repositories;

import net.tylerwade.discord.models.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, String> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    boolean existsByTag(String tag);

}
