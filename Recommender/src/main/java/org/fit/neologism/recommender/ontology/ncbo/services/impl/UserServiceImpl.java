package org.fit.neologism.recommender.ontology.ncbo.services.impl;


import org.fit.neologism.recommender.ontology.ncbo.models.Role;
import org.fit.neologism.recommender.ontology.ncbo.models.User;
import org.fit.neologism.recommender.ontology.ncbo.repositories.UserRepository;
import org.fit.neologism.recommender.ontology.ncbo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service("userService")
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void saveUser(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setActive(1);

        final Role userRole = Role.ROLE_USER;
        user.setRole(userRole);

        userRepository.save(user);
    }

}
