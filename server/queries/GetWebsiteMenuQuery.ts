// The website's header menu as edited in Odoo (Website > Menus): its root,
// the items under it, and their submenus (Odoo allows no deeper level).
export default `
  query {
    websiteMenu(noParent: true) {
      id
      childs {
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
  }
`
