package com.dupolvo.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// Envio real do codigo de "esqueci minha senha" por SMTP (Gmail ou outro
// provedor compativel). ATENCAO: nao funciona no Render - a plataforma
// bloqueia conexao SMTP de saida (porta 587), ver ResendMailSender pro
// que realmente funciona la. So fica ativo com app.mail.provider=smtp
// (variavel MAIL_PROVIDER no Render).
@Service
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "smtp")
public class SmtpMailSender implements MailSender {

    private final JavaMailSender javaMailSender;
    private final String from;

    public SmtpMailSender(JavaMailSender javaMailSender, @Value("${app.mail.from}") String from) {
        this.javaMailSender = javaMailSender;
        this.from = from;
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("Seu codigo para redefinir a senha - Dupolvo");
        message.setText("Seu codigo de verificacao e: " + otpCode
                + "\n\nEle vale por 10 minutos. Se voce nao pediu pra redefinir a senha, ignore este email.");
        javaMailSender.send(message);
    }
}
