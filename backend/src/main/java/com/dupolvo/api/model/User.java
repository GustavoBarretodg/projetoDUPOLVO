package com.dupolvo.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "email_verified", columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean emailVerified = false;

    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'USER'")
    private String role = "USER";

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String city = "";

    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean premium = false;

    // --- Esqueci minha senha (fluxo de OTP por email) ---
    // Nunca guarda o codigo em texto puro, so o hash (igual a senha). Attempts
    // limita tentativa de forca bruta antes de exigir reenvio. resetToken e
    // gerado so depois do OTP validado, pra trocar a senha sem repetir o OTP.
    @JsonIgnore
    @Column(name = "reset_otp_hash")
    private String resetOtpHash;

    @JsonIgnore
    @Column(name = "reset_otp_sent_at")
    private LocalDateTime resetOtpSentAt;

    @JsonIgnore
    @Column(name = "reset_otp_expires_at")
    private LocalDateTime resetOtpExpiresAt;

    @JsonIgnore
    @Column(name = "reset_otp_attempts", columnDefinition = "INTEGER DEFAULT 0")
    private Integer resetOtpAttempts = 0;

    @JsonIgnore
    @Column(name = "reset_token")
    private String resetToken;

    @JsonIgnore
    @Column(name = "reset_token_expires_at")
    private LocalDateTime resetTokenExpiresAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getPremium() { return premium; }
    public void setPremium(Boolean premium) { this.premium = premium; }

    public String getResetOtpHash() { return resetOtpHash; }
    public void setResetOtpHash(String resetOtpHash) { this.resetOtpHash = resetOtpHash; }

    public LocalDateTime getResetOtpSentAt() { return resetOtpSentAt; }
    public void setResetOtpSentAt(LocalDateTime resetOtpSentAt) { this.resetOtpSentAt = resetOtpSentAt; }

    public LocalDateTime getResetOtpExpiresAt() { return resetOtpExpiresAt; }
    public void setResetOtpExpiresAt(LocalDateTime resetOtpExpiresAt) { this.resetOtpExpiresAt = resetOtpExpiresAt; }

    public Integer getResetOtpAttempts() { return resetOtpAttempts; }
    public void setResetOtpAttempts(Integer resetOtpAttempts) { this.resetOtpAttempts = resetOtpAttempts; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public LocalDateTime getResetTokenExpiresAt() { return resetTokenExpiresAt; }
    public void setResetTokenExpiresAt(LocalDateTime resetTokenExpiresAt) { this.resetTokenExpiresAt = resetTokenExpiresAt; }
}
