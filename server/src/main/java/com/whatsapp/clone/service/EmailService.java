package com.whatsapp.clone.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("WhatsApp Pro <no-reply@whatsapp-pro.com>");
            message.setTo(to);
            message.setSubject("Your Secure Access Protocol Code");
            message.setText("Welcome to the Mesh.\n\n" +
                           "Your secure 6-digit OTP code is: " + otp + "\n\n" +
                           "This code will expire in 5 minutes.\n\n" +
                           "Stay Secure,\nThe WhatsApp Pro Node");
            mailSender.send(message);
            System.out.println("Email signal dispatched to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to dispatch email signal: " + e.getMessage());
            // We don't throw here to avoid crashing the flow if email fails during testing
        }
    }
}
