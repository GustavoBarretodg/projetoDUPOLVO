package com.dupolvo.api.service;

// Ponto unico pra plugar o envio de verdade (Gmail, Resend, SES, etc.) sem
// mexer no resto do fluxo de recuperacao de senha - so trocar a implementacao
// usada (hoje ConsoleMailSender, so pra log).
public interface MailSender {

    void sendPasswordResetOtp(String toEmail, String otpCode);
}
