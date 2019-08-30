function editentry(req, res, DB, Validator) {
    if (isLoggedIn(req)) //if logged in
    {
        let id = parseInt(req.params.id);
        if (id) //if id is int
        {
            let validator = new Validator();
            validator.set(req.body.source);
            validator.minLength(30);
            validator.maxLength(1000);
            let errors = validator.errors;
            if (errors) res.redirect('/journal/?err=' + errors);
            else {
                DB.find("journal", { id: id }, (result) => {
                    if (result.userId == req.session.userId) //if user has permission to change
                    {
                        DB.edit("journal", result, { text: req.body.source }, (results) => {
                            res.redirect('/journal/?msg=edited');
                        });
                    }
                });
            }
        }
        else res.redirect('/');
    }
    else res.redirect('/');
}

module.exports = editentry;