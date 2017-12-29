package org.fit.neologism.recommender.ontology.ncbo.controllers;

import org.fit.neologism.recommender.ontology.ncbo.models.User;
import org.fit.neologism.recommender.ontology.ncbo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import javax.validation.Valid;

@Controller
public class RegistrationController {

    @Autowired
    UserService userService;

    @GetMapping("/registration")
    public String login(Model model) {
        model.addAttribute("user", new User());
        return "registration";
    }

    @PostMapping(value = "/registration")
    public String createNewUser(Model model, @Valid User user, BindingResult bindingResult) {
        final User userExists = userService.findUserByEmail(user.getEmail());

        if (userExists != null) {
            bindingResult.rejectValue("email", "error.user",
                    "There is already a user registered with the email provided");
        }

        if (bindingResult.hasErrors()) {
            return "registration";
        }

        userService.saveUser(user);

        model.addAttribute("successMessage", "User has been registered successfully!");
        model.addAttribute("user", new User());

        return "registration";
    }

}