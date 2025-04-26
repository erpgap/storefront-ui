export default `
  query ($id: Int!) {
    country(id: $id) {
      id
      name
      code
      states {
        id
        name
        code
      }
    }
  }
`
