function newentry(req, res, DB, Validator, isLoggedIn, currentTime) {
    if (isLoggedIn(req)) {
        let validator = new Validator();
        validator.set(req.body.source);
        validator.minLength(30);
        validator.maxLength(1000);
        let errors = validator.errors;
        if (!errors) {
            let obj = {
                userId: req.session.userId,
                time: currentTime(),
                text: req.body.source
            };
            DB.addElement("journal", "journalid", obj, () => {
                res.redirect('journal/?msg=added');
            });
        }
        else res.redirect(`journal/?err=${errors}`);
    }
    else res.redirect("/");
}

module.exports = newentry;