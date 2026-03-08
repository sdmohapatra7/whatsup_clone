package com.whatsapp.clone.controller;

import com.whatsapp.clone.model.Otp;
import com.whatsapp.clone.model.Status;
import com.whatsapp.clone.model.User;
import com.whatsapp.clone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.whatsapp.clone.repository.OtpRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    private final OtpRepository otpRepository;

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return ResponseEntity.badRequest().body("Phone number is required");
        }

        // Generate a simple 6-digit OTP
        String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));

        // Print it to the console (simulating SMS)
        System.out.println("==================================================");
        System.out.println("OTP for " + phoneNumber + " is: " + otpCode);
        System.out.println("==================================================");

        // Delete old OTP for this phone if exists
        otpRepository.deleteByPhoneNumber(phoneNumber);

        Otp otp = Otp.builder()
                .phoneNumber(phoneNumber)
                .otpCode(otpCode)
                .expirationTime(java.time.LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(otp);
        return ResponseEntity.ok().body("OTP sent successfully");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otpCode = request.get("otpCode");

        Optional<Otp> otpOpt = otpRepository.findFirstByPhoneNumber(phoneNumber);
        if (otpOpt.isPresent() && otpOpt.get().getOtpCode().equals(otpCode)) {
            // Check expiration
            if (otpOpt.get().getExpirationTime().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP expired");
            }

            // OTP is valid. Clean it up.
            otpRepository.deleteByPhoneNumber(phoneNumber);

            // Fetch existing user or create a new one
            User user = userRepository.findFirstByPhoneNumber(phoneNumber).orElseGet(() -> {
                User newUser = User.builder()
                        .phoneNumber(phoneNumber)
                        .username(phoneNumber)
                        .fullName("New User")
                        .status(Status.ONLINE)
                        .twoStepEnabled(false)
                        .build();
                return userRepository.save(newUser);
            });

            if (user.isTwoStepEnabled()) {
                // If 2FA is enabled, don't log them in fully yet.
                // Return a special payload indicating they need to provide the PIN.
                return ResponseEntity.status(HttpStatus.ACCEPTED)
                        .body(Map.of(
                                "userId", user.getId(),
                                "requiresTwoStep", true));
            }

            user.setStatus(Status.ONLINE);
            userRepository.save(user);

            return ResponseEntity.ok(user);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
    }

    @PostMapping("/verify-two-step")
    public ResponseEntity<?> verifyTwoStep(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String pin = request.get("pin");

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.isTwoStepEnabled() && user.getTwoStepPin().equals(pin)) {
                user.setStatus(Status.ONLINE);
                userRepository.save(user);
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN");
    }

    @PostMapping("/{id}/two-step")
    public ResponseEntity<?> enableTwoStep(@PathVariable("id") String id, @RequestBody Map<String, String> request) {
        String pin = request.get("pin");
        if (pin == null || pin.length() != 6) {
            return ResponseEntity.badRequest().body("PIN must be exactly 6 digits");
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setTwoStepEnabled(true);
            user.setTwoStepPin(pin);
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}/two-step")
    public ResponseEntity<?> disableTwoStep(@PathVariable("id") String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setTwoStepEnabled(false);
            user.setTwoStepPin(null);
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable("id") String id, @RequestBody User profileUpdates) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (profileUpdates.getFullName() != null)
                user.setFullName(profileUpdates.getFullName());
            if (profileUpdates.getEmail() != null)
                user.setEmail(profileUpdates.getEmail());
            if (profileUpdates.getProfileImageUrl() != null)
                user.setProfileImageUrl(profileUpdates.getProfileImageUrl());

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/logout/{username}")
    public ResponseEntity<?> logoutUser(@PathVariable("username") String username) {
        // Here username is either the old username or the new phoneNumber
        Optional<User> userOpt = userRepository.findFirstByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findFirstByPhoneNumber(username);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(Status.OFFLINE);
            userRepository.save(user);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
