/**
 *
 * A map of route names to URLs so that they can be renamed easily.
 *
 */

module.exports = {
    home: '/',
    login: '/login',
    logout: '/logout',
    signup: '/signup',
    api: {
        login: '/api/login',
        signup: '/api/signup',
        userList: '/api/user',
        userShow: '/api/user/:id',
        userUpdate: '/api/user/:id',
    }
}
