export type ActivityIcon = 'food' | 'tutor' | 'event';

export interface IPortalActivity {
  title: string;
  description: string;
  icon: ActivityIcon;
}

//!Si luego el back cambia, actualizamos aquí.
