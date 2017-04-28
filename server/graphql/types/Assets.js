const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLBuffer,
} = require('graphql');
const { DateTime } = require('./CustomTypes');

exports.file = new GraphQLInputObjectType({
  name: 'File',
  description: 'A file uploaded via multipart/form-data',
  fields: () => ({
    fieldname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The fieldname used to POST this file.',
    },
    originalname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The original file name.',
    },
    buffer: {
      type: new GraphQLNonNull(GraphQLBuffer),
      description: 'The file buffered in memory',
    },
  }),
});

exports.outputType = new GraphQLObjectType({
  name: 'Asset',
  fields: {
    _id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    extension: {
      type: new GraphQLNonNull(GraphQLString),
    },
    filename: {
      type: new GraphQLNonNull(GraphQLString),
    },
    dateCreated: {
      type: new GraphQLNonNull(DateTime),
    },
    width: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    height: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    size: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    mimetype: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

exports.inputType = new GraphQLInputObjectType({
  name: 'AssetInput',
  fields: {
    title: {
      type: GraphQLString,
    },
    filename: {
      type: GraphQLString,
    },
    mimetype: {
      type: GraphQLString,
    },
    size: {
      type: GraphQLInt,
    },
    width: {
      type: GraphQLInt,
    },
    height: {
      type: GraphQLInt,
    },
  },
});
