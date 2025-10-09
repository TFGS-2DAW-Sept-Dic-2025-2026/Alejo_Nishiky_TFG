package es.daw.vecinotechbackend.service;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.transactional.SendContact;
import com.mailjet.client.transactional.SendEmailsRequest;
import com.mailjet.client.transactional.TransactionalEmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    private static String escape(String s) {
        return s == null ? "" : s.replace("<","&lt;").replace(">","&gt;");
    }
}
