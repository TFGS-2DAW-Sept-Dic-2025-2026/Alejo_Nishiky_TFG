package es.daw.vecinotechbackend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private int codigo;
    private String mensaje;
    private T datos;

    public ApiResponse() {}

    public ApiResponse(int codigo, String mensaje, T datos) {
        this.codigo = codigo;
        this.mensaje = mensaje;
        this.datos = datos;
    }

    // Métodos de fábrica
    public static <T> ApiResponse<T> ok(T datos) {
        return new ApiResponse<>(0, "OK", datos);
    }

    public static <T> ApiResponse<T> ok(String mensaje, T datos) {
        return new ApiResponse<>(0, mensaje, datos);
    }

    public static <T> ApiResponse<T> error(int codigo, String mensaje) {
        return new ApiResponse<>(codigo, mensaje, null);
    }

}

