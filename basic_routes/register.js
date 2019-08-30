function router(req, res)
{
    if(req.session.username || req.session.email || req.session.userId) res.redirect('/'); 
    else res.render('register');
}

module.exports = router;