import { IValoracion } from "../IValoracion";
import ISolicitante from "./ISolicitante";
import IUbicacion from "./IUbicacion";


export default interface ISolicitudMapa {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  ubicacion: IUbicacion;
  solicitante: ISolicitante;
  voluntario?: ISolicitante;
  fecha_creacion: string;
  valoracion?: IValoracion;
}
