package com.dupolvo.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

// ATENCAO: nao manda email nenhum de verdade - so registra o codigo no log
// do servidor (visivel no Render em Logs). Fica ativo enquanto MAIL_ENABLED
// nao for "true" (ver SmtpMailSender) - ou seja, antes de configurar
// MAIL_USERNAME/MAIL_PASSWORD e virar a chave, ninguem recebe o codigo por
// email de verdade, so dá pra ver no log.
@Service
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "false", matchIfMissing = true)
public class ConsoleMailSender implements MailSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleMailSender.class);

    @Override
    public void sendPasswordResetOtp(String toEmail, String otpCode) {
        log.warn("[RESET DE SENHA] Nenhum provedor de email configurado ainda - "
                + "codigo gerado pra {} foi {} (so aparece aqui no log)", toEmail, otpCode);
    }
}
