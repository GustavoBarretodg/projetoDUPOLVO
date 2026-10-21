package com.dupolvo.api.service;

import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// Fluxo de "esqueci minha senha": email -> codigo (OTP) de 6 digitos por
// email -> resetToken de uso unico -> nova senha. Nunca revela se um email
// existe ou nao (sempre responde "otp_sent"), pra nao dar pra descobrir quem
// tem conta so tentando emails.
@Service
public class PasswordResetService {

    private static final int OTP_LENGTH = 6;
    private static final long OTP_VALID_MINUTES = 10;
    private static final long OTP_RESEND_COOLDOWN_SECONDS = 60;
    private static final int OTP_MAX_ATTEMPTS = 5;
    private static final long RESET_TOKEN_VALID_MINUTES = 15;
    private static final int MIN_PASSWORD_LENGTH = 6;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(UserRepository userRepository, PasswordEncoder passwordEncoder, MailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public Map<String, Object> forgotPassword(String email) {
        Map<String, Object> response = new HashMap<>();
        // Resposta sempre igual, exista ou nao o email - so por dentro decide
        // se manda o codigo.
        response.put("message", "otp_sent");

        if (email == null || email.isBlank()) return response;
        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) return response;

        User user = userOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (user.getResetOtpSentAt() != null
                && user.getResetOtpSentAt().plusSeconds(OTP_RESEND_COOLDOWN_SECONDS).isAfter(now)) {
            // Ja mandou um codigo ha pouco - nao gera outro nem reenvia, pra
            // nao dar pra spammar o email de alguem clicando varias vezes.
            return response;
        }

        String otp = generateOtp();
        user.setResetOtpHash(passwordEncoder.encode(otp));
        user.setResetOtpSentAt(now);
        user.setResetOtpExpiresAt(now.plusMinutes(OTP_VALID_MINUTES));
        user.setResetOtpAttempts(0);
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);

        mailSender.sendPasswordResetOtp(user.getEmail(), otp);
        return response;
    }

    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = email == null ? Optional.empty() : userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty() || otp == null || otp.isBlank()) {
            response.put("message", "invalid_otp");
            return response;
        }

        User user = userOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (user.getResetOtpHash() == null || user.getResetOtpExpiresAt() == null
                || user.getResetOtpExpiresAt().isBefore(now)) {
            response.put("message", "otp_expired");
            return response;
        }

        int attempts = user.getResetOtpAttempts() == null ? 0 : user.getResetOtpAttempts();
        if (attempts >= OTP_MAX_ATTEMPTS) {
            invalidateOtp(user);
            response.put("message", "otp_expired");
            return response;
        }

        if (!passwordEncoder.matches(otp.trim(), user.getResetOtpHash())) {
            user.setResetOtpAttempts(attempts + 1);
            userRepository.save(user);
            response.put("message", "invalid_otp");
            return response;
        }

        // Codigo certo: troca por um resetToken de uso unico, so pra nao
        // precisar digitar o OTP de novo na tela de trocar a senha.
        String resetToken = generateResetToken();
        user.setResetToken(resetToken);
        user.setResetTokenExpiresAt(now.plusMinutes(RESET_TOKEN_VALID_MINUTES));
        invalidateOtp(user);
        userRepository.save(user);

        response.put("message", "otp_verified");
        response.put("resetToken", resetToken);
        return response;
    }

    public Map<String, Object> resetPassword(String email, String resetToken, String newPassword) {
        Map<String, Object> response = new HashMap<>();

        if (newPassword == null || newPassword.length() < MIN_PASSWORD_LENGTH) {
            response.put("message", "password_too_short");
            return response;
        }

        Optional<User> userOpt = email == null ? Optional.empty() : userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            response.put("message", "invalid_reset_token");
            return response;
        }

        User user = userOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (user.getResetToken() == null || resetToken == null
                || !user.getResetToken().equals(resetToken)
                || user.getResetTokenExpiresAt() == null
                || user.getResetTokenExpiresAt().isBefore(now)) {
            response.put("message", "invalid_reset_token");
            return response;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        invalidateOtp(user);
        userRepository.save(user);

        response.put("message", "password_updated");
        return response;
    }

    private void invalidateOtp(User user) {
        user.setResetOtpHash(null);
        user.setResetOtpExpiresAt(null);
        user.setResetOtpAttempts(0);
    }

    private String generateOtp() {
        int max = (int) Math.pow(10, OTP_LENGTH);
        int value = random.nextInt(max);
        return String.format("%0" + OTP_LENGTH + "d", value);
    }

    private String generateResetToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
