package com.whatsapp.clone.repository;

import com.whatsapp.clone.model.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OtpRepository extends MongoRepository<Otp, String> {
    Optional<Otp> findFirstByPhoneNumber(String phoneNumber);

    void deleteByPhoneNumber(String phoneNumber);
}
