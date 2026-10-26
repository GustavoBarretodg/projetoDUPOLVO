package com.dupolvo.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

// Envio real do codigo de "esqueci minha senha" via API da Resend (HTTPS) -
// usamos API em vez de SMTP porque o Render bloqueia conexao SMTP de saida
// (ver SmtpMailSender). So fica ativo com app.mail.provider=resend (variavel
// MAIL_PROVIDER=resend no Render) e precisa de RESEND_API_KEY configurada.
// Sem dominio proprio verificado na Resend, so da pra mandar pro email da
// conta que criou a API key - pra mandar pra qualquer usuario, verifica um
// dominio em resend.com/domains e troca o MAIL_FROM.
@Service
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "resend")
public class ResendMailSender implements MailSender {

    private static final URI RESEND_API_URL = URI.create("https://api.resend.com/emails");

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String apiKey;
    private final String from;

    public ResendMailSender(@Value("${resend.api.key}") String apiKey, @Value("${app.mail.from}") String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String otpCode) {
        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "from", from,
                    "to", List.of(toEmail),
                    "subject", "Seu codigo para redefinir a senha - Dupolvo",
                    "text", "Seu codigo de verificacao e: " + otpCode
                            + "\n\nEle vale por 10 minutos. Se voce nao pediu pra redefinir a senha, ignore este email."
            ));

            HttpRequest request = HttpRequest.newBuilder(RESEND_API_URL)
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new IllegalStateException("Resend respondeu " + response.statusCode() + ": " + response.body());
            }
        } catch (Exception e) {
            throw new RuntimeException("Falha ao mandar email via Resend", e);
        }
    }
}
