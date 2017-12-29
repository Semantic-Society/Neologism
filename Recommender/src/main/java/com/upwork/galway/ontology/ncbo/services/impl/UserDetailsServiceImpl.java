package org.fit.neologism.recommender.ontology.ncbo.services.impl;

import org.fit.neologism.recommender.ontology.ncbo.models.User;
import org.fit.neologism.recommender.ontology.ncbo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        final User user = userRepository.findByEmail(username);

        if(user == null)
            throw new UsernameNotFoundException("User now found!");

        final Set<GrantedAuthority> grantedAuthorities = new HashSet();
        grantedAuthorities.add(new SimpleGrantedAuthority(user.getRole().name()));

        final UserDetails userDetails = new org.springframework.security.core.userdetails.User(user.getName(),
                user.getPassword(), grantedAuthorities);
        return userDetails;
    }
}