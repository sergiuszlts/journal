function router(req, res)
{
    if(req.session.username && req.session.email && req.session.id) res.render('journal');
    else res.redirect('/'); 
}

module.exports = router;