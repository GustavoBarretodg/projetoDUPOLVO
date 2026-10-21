package com.dupolvo.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

// ATENCAO: nao manda email nenhum de verdade - so registra o codigo no log
// do servidor (visivel no Render em Logs), pra dar pra testar o fluxo de
// "esqueci minha senha" de ponta a ponta antes de escolher um provedor de
// email de verdade (Gmail/SMTP, Resend, SES...). Troque essa classe por uma
// implementacao real de MailSender - e registre so ela como @Service - antes
// de liberar essa tela pros usuarios, senao ninguem recebe o codigo.
@Service
public class ConsoleMailSender implements MailSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleMailSender.class);

    @Override
    public void sendPasswordResetOtp(String toEmail, String otpCode) {
        log.warn("[RESET DE SENHA] Nenhum provedor de email configurado ainda - "
                + "codigo gerado pra {} foi {} (so aparece aqui no log)", toEmail, otpCode);
    }
}
