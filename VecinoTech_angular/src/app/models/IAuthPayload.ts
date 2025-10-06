import { IUsuario } from "./interfaces_orm/IUsuario";

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  usuario: IUsuario;
}
