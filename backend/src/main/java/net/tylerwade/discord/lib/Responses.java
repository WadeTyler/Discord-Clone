// A library of common ResponseEntities using this projects format for Messages.

package net.tylerwade.discord.lib;

import org.springframework.boot.reactor.ReactorEnvironmentPostProcessor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class Responses {

    public static ResponseEntity<ErrorMessage> badRequest (String errorMessage) {
        return new ResponseEntity<ErrorMessage>(new ErrorMessage(errorMessage), HttpStatus.BAD_REQUEST);
    }

    public static ResponseEntity<ErrorMessage> internalServerError () {
        return new ResponseEntity<ErrorMessage>(new ErrorMessage("Internal Server Error"), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static ResponseEntity<ErrorMessage> notFound (String errorMessage) {
        return new ResponseEntity<ErrorMessage>(new ErrorMessage(errorMessage), HttpStatus.NOT_FOUND);
    }

    public static ResponseEntity<SuccessMessage> successMessage (String message) {
        return new ResponseEntity<SuccessMessage>(new SuccessMessage(message), HttpStatus.OK);
    }

}
