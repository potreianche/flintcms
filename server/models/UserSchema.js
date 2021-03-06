const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    first: String,
    last: String
  },
  password: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    lowercase: true,
    required: true,
    unique: true
  },
  usergroup: {
    type: Schema.Types.ObjectId,
    ref: 'UserGroup',
    required: true
  },
  image: String,
  dateCreated: {
    type: Date,
    default: Date.now
  },
  token: String
})

UserSchema.name = 'User'

// eslint-disable-next-line func-names
UserSchema.pre('validate', async function (next) {
  if (this.usergroup) next()

  const UserGroup = mongoose.model('UserGroup')
  const admin = await UserGroup.findOne({ slug: 'admin' }).select('_id').exec()
  if (!admin) next(new Error('There is no admin usergroup'))
  this.usergroup = admin._id

  next()
})

// Generate hash
UserSchema.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync())

// Validate hash
// Can't use arrow function because of (this) binding
// eslint-disable-next-line func-names
UserSchema.methods.validateHash = function (password) {
  return bcrypt.compareSync(password, this.password)
}

// eslint-disable-next-line func-names
UserSchema.methods.getPermissions = async function () {
  const UserGroup = mongoose.model('UserGroup')
  const usergroup = await UserGroup.findById(this.usergroup)
  if (!usergroup) throw new Error('The User Group could not be found')

  return usergroup.permissions
}

module.exports = UserSchema
