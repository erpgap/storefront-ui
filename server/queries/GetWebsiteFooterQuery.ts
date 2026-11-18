// The website's footer as edited in Odoo (Website > Configuration > Website
// Footer): each top entry a column, its submenu the column's links. And the
// company's social media accounts (Website > Settings), for the icons.
export default `
  query {
    websiteFooter(noParent: true) {
      id
      name
      url
      childs {
        id
        name
        url
      }
    }
    website {
      company {
        name
        socialTwitter
        socialLinkedin
        socialGithub
        socialFacebook
        socialInstagram
        socialYoutube
      }
    }
  }
`
