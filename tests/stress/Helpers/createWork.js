export const createWork = ({ content = 'test' } = {}) => {
  return {
    name: 'test now',
    datePublished: '2017-11-24T00:38:41.595Z',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    tags: '1,1,1',
    content,
  }
}
