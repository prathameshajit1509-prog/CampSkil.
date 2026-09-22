
package com.campusconnect.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").permitAll() // Open for easy team testing; lock down with .hasRole("ADMIN") later if needed
                .anyRequest().permitAll()
            )
            .httpBasic(httpBasic -> {});
            
        return http.build();
    }
}