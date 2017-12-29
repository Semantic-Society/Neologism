package org.fit.neologism.recommender.ontology.ncbo.services;

import org.fit.neologism.recommender.ontology.ncbo.models.User;

public interface UserService {
    User findUserByEmail(String email);
    void saveUser(User user);
}
