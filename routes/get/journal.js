function journal(req, res, DB, isLoggedIn) {
    if (isLoggedIn(req)) {
        DB.findAll("journal", { userId: req.session.userId }, (result) => { //find all entries of a given user
            let query = {};
            if (req.query.err) query.errors = req.query.err;
            if (req.query.msg == "removed") query.message = "Entry removed";
            else if (req.query.msg == "added") query.message = "New entry added";
            else if (req.query.msg == "edited") query.message = "Entry edited";
            if (result.length > 0) query.posts = result.reverse();
            res.render('journal', query);
        });
    }
    else res.redirect('/');
}

module.exports = journal;