package com.ecommerce.codigo_fonte.utils;


import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
 
public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String rawPassword = "senha123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        System.out.println(encodedPassword);
    }
}
