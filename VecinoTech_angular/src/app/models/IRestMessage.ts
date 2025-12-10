/*
  Respuesta estándar del backend
*/
export default interface IRestMessage {
    codigo: number,
    mensaje: string,
    datos?: any
}
