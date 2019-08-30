function register(req, res, DB, bcrypt, saltRounds, Validator, isLoggedIn) {
    if (isLoggedIn(req)) res.redirect('/');
    else {
        let validator = new Validator();
        validator.set(req.body.username);
        validator.minLength(4);
        validator.maxLength(30);
        let usernameErrors = validator.errors;
        validator.set(req.body.password);
        validator.minLength(8);
        validator.maxLength(50);
        let passwordErrors = validator.errors;
        validator.set(req.body.email);
        validator.minLength(5);
        validator.maxLength(40);
        validator.isEmail();
        let emailErrors = validator.errors;
        validator.set(req.body.passwordRepeat);
        validator.passwordEqual(req.body.password);
        let passwordRepeatErrors = validator.errors;
        DB.exists("journalusers", { "email": req.body.email }, (result) => { //check if email is already used
            if (result) emailErrors = "The email is already used"; //if there is email in database
            if (!usernameErrors && !passwordErrors && !emailErrors && !passwordRepeatErrors) { //if there are no errors
                let obj = {
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password, saltRounds),
                    email: req.body.email
                }
                DB.addElement("journalusers", "journaluserid", obj, () => {
                    res.render('login', {
                        message: "Registration successful, you can log in to your new account",
                        email: req.body.email
                    });
                });
            }
            else res.render('register', {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                usernameErrors: usernameErrors,
                passwordErrors: passwordErrors,
                emailErrors: emailErrors,
                passwordRepeatErrors: passwordRepeatErrors
            });
        });
    }
}

module.exports = register;