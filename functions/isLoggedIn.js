function isLoggedIn(req)
{
    return req.session.username && req.session.email && req.session.userId;
}


module.exports = isLoggedIn;