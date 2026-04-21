package com.whatsapp.clone.repository;

import com.whatsapp.clone.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findFirstByUsername(String username);
    Optional<User> findFirstByPhoneNumber(String phoneNumber);
    Optional<User> findFirstByEmail(String email);
}
