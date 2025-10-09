ALTER TABLE app_user
    ALTER COLUMN rol SET DEFAULT 'USER';

ALTER TABLE app_user
    ADD CONSTRAINT chk_app_user_rol CHECK (rol IN ('USER','ADMIN'));
