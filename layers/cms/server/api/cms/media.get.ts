// Lists what the merchant can pick from: images are attachments in Odoo, with
// its access rules and backups. Odoo decides whether this user may see them.
export default defineEventHandler(event => listOdooMedia(event))
