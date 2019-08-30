function login(req, res, DB, bcrypt, isLoggedIn) {
    if (isLoggedIn(req)) res.redirect('/');
    else {
        DB.find("journalusers", { email: req.body.email }, (result) => {
            let errors = null;
            if (!result) errors = "Incorrect data";
            else if (!bcrypt.compareSync(req.body.password, result.password)) errors = "Wrong password";
            if (!errors) {
                console.log("Logged in");
                req.session.email = result.email;
                req.session.username = result.username;
                req.session.userId = result.id;
                res.redirect('/');
            }
            else res.render('login', { email: req.body.email, password: req.body.password, errors: errors });
        });
    }
}

module.exports = login;