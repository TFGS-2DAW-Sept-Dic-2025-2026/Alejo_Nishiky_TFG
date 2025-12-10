import { IUsuario } from "../usuario/IUsuario";

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  usuario: IUsuario;
}
