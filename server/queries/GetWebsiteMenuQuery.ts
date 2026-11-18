// The website's header menu as edited in Odoo (Website > Configuration >
// Header Menu): its top entries, the ones with no parent, and their submenus
// (Odoo allows no deeper level).
export default `
  query {
    websiteHeaderMenu {
      id
      name
      url
      childs {
        id
        name
        url
      }
    }
  }
`
