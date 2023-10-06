module.exports = (req, res, next) => {
    const allowedRoutes = ['/', '/login', '/signup', 'about']; // Routes that don't require authentication

    if (!allowedRoutes.includes(req.path) && !req.session.userid) {
        return res.redirect('/login');
    }
    next();
};