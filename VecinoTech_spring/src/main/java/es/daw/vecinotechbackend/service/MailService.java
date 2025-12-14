package es.daw.vecinotechbackend.service;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.transactional.SendContact;
import com.mailjet.client.transactional.SendEmailsRequest;
import com.mailjet.client.transactional.TransactionalEmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.mailjet.client.transactional.TrackClicks;

@Service
public class MailService {

    private final MailjetClient client;
    private final String senderEmail;
    private final String senderName;

    public MailService(@Value("${mailjet.api.key}") String apiKey,
                       @Value("${mailjet.api.secret}") String apiSecret,
                       @Value("${mailjet.sender.email}") String senderEmail,
                       @Value("${mailjet.sender.name}") String senderName) {
        ClientOptions options = ClientOptions.builder()
                .apiKey(apiKey)
                .apiSecretKey(apiSecret)
                .build();
        this.client = new MailjetClient(options);
        this.senderEmail = senderEmail;
        this.senderName = senderName;
    }

    public void enviarActivacion(String toEmail, String toName, String activarUrl) throws MailjetException {
        String html = """
            <div style="font-family:system-ui,Arial,sans-serif;">
              <h2>Confirma tu cuenta</h2>
              <p>Hola %s,</p>
              <p>Gracias por registrarte en <b>VecinoTech</b>. Para activar tu cuenta, por favor pulsa el botón:</p>
              <p>
                <a href="%s" style="display:inline-block;padding:12px 18px;background:#1f2b55;color:#fff;text-decoration:none;border-radius:8px;">
                  Activar mi cuenta
                </a>
              </p>
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p><a href="%s">%s</a></p>
              <hr/>
              <small>Si no has sido tú, ignora este mensaje.</small>
            </div>
            """.formatted(escape(toName), activarUrl, activarUrl, activarUrl);

        TransactionalEmail message = TransactionalEmail
                .builder()
                .to(new SendContact(toEmail, toName))
                .from(new SendContact(senderEmail, senderName))
                .subject("Activa tu cuenta en VecinoTech")
                .htmlPart(html)
                .build();

        SendEmailsRequest request = SendEmailsRequest.builder().message(message).build();
        request.sendWith(client);
    }

    /**
     * Envía correo de recuperación de contraseña
     *
     * @param toEmail Email del destinatario
     * @param toName Nombre del destinatario
     * @param resetUrl URL para restablecer la contraseña
     * @throws MailjetException Si hay error al enviar el correo
     */
    public void enviarRecuperacion(String toEmail, String toName, String resetUrl) throws MailjetException {
        String html = """
            <div style="font-family:system-ui,Arial,sans-serif;">
              <h2>Recuperar contraseña</h2>
              <p>Hola %s,</p>
              <p>Hemos recibido una solicitud para restablecer tu contraseña en <b>VecinoTech</b>.</p>
              <p>Para establecer una nueva contraseña, haz clic en el siguiente botón:</p>
              <p>
                <a href="%s" style="display:inline-block;padding:12px 18px;background:#1f2b55;color:#fff;text-decoration:none;border-radius:8px;">
                  Restablecer mi contraseña
                </a>
              </p>
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p><a href="%s">%s</a></p>
              <p><strong>Este enlace expirará en 1 hora.</strong></p>
              <hr/>
              <small>Si no has solicitado este cambio, ignora este mensaje. Tu contraseña permanecerá sin cambios.</small>
            </div>
            """.formatted(escape(toName), resetUrl, resetUrl, resetUrl);

        TransactionalEmail message = TransactionalEmail
                .builder()
                .to(new SendContact(toEmail, toName))
                .from(new SendContact(senderEmail, senderName))
                .subject("Recuperar contraseña - VecinoTech")
                .htmlPart(html)
                .trackClicks(TrackClicks.DISABLED)
                .build();

        SendEmailsRequest request = SendEmailsRequest.builder().message(message).build();
        request.sendWith(client);
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("<","&lt;").replace(">","&gt;");
    }
}
