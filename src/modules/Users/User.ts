import UsersController from './User.controller'
import UsersDAO from './Users.dao'

const userDAO = new UsersDAO()
const usersController = new UsersController(userDAO)

export default usersController
