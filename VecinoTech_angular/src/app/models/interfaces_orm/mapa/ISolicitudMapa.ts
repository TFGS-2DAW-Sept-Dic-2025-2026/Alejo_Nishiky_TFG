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
  fecha_creacion: string;
}
