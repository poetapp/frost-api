import { UsersController } from './User.controller'
import { UsersDAO } from './Users.dao'

const userDAO = new UsersDAO()
export const usersController = new UsersController(userDAO)
