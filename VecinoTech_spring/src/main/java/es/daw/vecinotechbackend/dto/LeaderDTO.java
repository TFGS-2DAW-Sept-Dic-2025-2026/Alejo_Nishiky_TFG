package es.daw.vecinotechbackend.dto;

public record LeaderDTO(String name, long points) {
}

//Usamos record para hacer DTOS inmutables sin escribir getters, setters, etc ...
//Mas limpio, sin boilerplate.
