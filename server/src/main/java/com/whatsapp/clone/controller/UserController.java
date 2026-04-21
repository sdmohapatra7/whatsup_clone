package com.whatsapp.clone.controller;

import com.whatsapp.clone.model.Otp;
import com.whatsapp.clone.model.Status;
import com.whatsapp.clone.model.User;
import com.whatsapp.clone.repository.UserRepository;
import com.whatsapp.clone.repository.OtpRepository;
import com.whatsapp.clone.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final JwtTokenProvider tokenProvider;
    private final SimpMessageSendingOperations messagingTemplate;
    private final com.whatsapp.clone.service.EmailService emailService;

    public UserController(UserRepository userRepository, OtpRepository otpRepository, JwtTokenProvider tokenProvider, SimpMessageSendingOperations messagingTemplate, com.whatsapp.clone.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.tokenProvider = tokenProvider;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
    }

    /**
     * STEP 1: Traditional Credential Registration / Login
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findFirstByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        user.setUsername(user.getEmail()); // Use email as primary username
        user.setStatus(Status.OFFLINE);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String fullName = request.get("fullName");

        Optional<User> userOpt = userRepository.findFirstByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Existing user: check password
            if (password != null && user.getPassword() != null && user.getPassword().equals(password)) {
                return ResponseEntity.ok(Map.of(
                    "status", "STEP_1_SUCCESS",
                    "message", "Welcome back! Credentials verified.",
                    "userId", user.getId()
                ));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials for existing account.");
        } else {
            // New user: Create account
            User newUser = User.builder()
                    .email(email)
                    .password(password)
                    .username(email)
                    .fullName(fullName != null && !fullName.isEmpty() ? fullName : email.split("@")[0])
                    .status(Status.OFFLINE)
                    .build();
            
            User saved = userRepository.save(newUser);
            return ResponseEntity.ok(Map.of(
                "status", "STEP_1_SUCCESS",
                "message", "Account created successfully. Continuing to verification.",
                "userId", saved.getId()
            ));
        }
    }

    /**
     * STEP 2: Phone Verification via OTP
     */
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String userId = request.get("userId");

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return ResponseEntity.badRequest().body("Phone number is required");
        }

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        System.out.println("==================================================");
        System.out.println("SECURE OTP for " + phoneNumber + " is: " + otpCode);
        System.out.println("==================================================");

        // SEND EMAIL if userId provided
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                if (user.getEmail() != null) {
                    emailService.sendOtpEmail(user.getEmail(), otpCode);
                }
            });
        }

        otpRepository.deleteByPhoneNumber(phoneNumber);
        Otp otp = Otp.builder()
                .phoneNumber(phoneNumber)
                .otpCode(otpCode)
                .expirationTime(LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(otp);
        return ResponseEntity.ok().body("OTP signal generated and sent.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otpCode = request.get("otpCode");
        String userId = request.get("userId"); // Optional link to Step 1 user

        Optional<Otp> otpOpt = otpRepository.findFirstByPhoneNumber(phoneNumber);
        if (otpOpt.isPresent() && otpOpt.get().getOtpCode().equals(otpCode)) {
            if (otpOpt.get().getExpirationTime().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP expired");
            }

            otpRepository.deleteByPhoneNumber(phoneNumber);

            User user;
            if (userId != null) {
                // Link OTP to the user from Step 1
                user = userRepository.findById(userId).get();
                user.setPhoneNumber(phoneNumber);
                userRepository.save(user);
            } else {
                // Legacy OTP-only login or guest
                user = userRepository.findFirstByPhoneNumber(phoneNumber).orElseGet(() -> {
                    User newUser = User.builder()
                            .phoneNumber(phoneNumber)
                            .username(phoneNumber)
                            .fullName("Authenticated Node")
                            .status(Status.ONLINE)
                            .build();
                    return userRepository.save(newUser);
                });
            }

            user.setStatus(Status.ONLINE);
            userRepository.save(user);

            String token = tokenProvider.generateToken(user.getId());
            return ResponseEntity.ok(Map.of("user", user, "token", token));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/logout/{username}")
    public ResponseEntity<?> logoutUser(@PathVariable("username") String username) {
        Optional<User> userOpt = userRepository.findFirstByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(Status.OFFLINE);
            userRepository.save(user);
            messagingTemplate.convertAndSend("/topic/public", Map.of("userId", user.getId(), "status", "OFFLINE"));
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
