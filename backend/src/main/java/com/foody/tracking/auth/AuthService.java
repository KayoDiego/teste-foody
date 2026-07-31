package com.foody.tracking.auth;

import com.foody.tracking.auth.dto.AuthResponse;
import com.foody.tracking.auth.dto.LoginRequest;
import com.foody.tracking.auth.dto.RegisterRequest;
import com.foody.tracking.auth.dto.UserResponse;
import com.foody.tracking.common.EmailAlreadyUsedException;
import com.foody.tracking.security.JwtService;
import com.foody.tracking.user.User;
import com.foody.tracking.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException("E-mail já cadastrado: " + request.email());
        }

        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow();
        return toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(token, jwtService.getExpirationMs(), toUserResponse(user));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
