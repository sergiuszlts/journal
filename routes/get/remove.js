function remove(req, res, DB, isLoggedIn) {
    if (isLoggedIn(req)) //if logged in
    {
        let id = parseInt(req.params.id);
        if (id) //if id is int
        {
            DB.find("journal", { id: id }, (result) => {
                if (result.userId == req.session.userId) //if user has permission to delete
                {
                    DB.remove("journal", result, (results) => {
                        res.redirect('/journal/?msg=removed');
                    });
                }
            });
        }
        else res.redirect('/');
    }
    else {
        res.redirect('/');
    }
}

module.exports = remove;