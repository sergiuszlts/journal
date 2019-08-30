function logout(req, res) {
    req.session.destroy((error) => {
        if (error) return error;
        res.redirect('/');
    });
}

module.exports = logout;