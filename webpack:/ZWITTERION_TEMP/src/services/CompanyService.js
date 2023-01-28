import urlHelper from '../libraries/urlHelper'

class CompanyService {
    constructor () {
        this.company_slugs = [
            'vomar1080',
            'intratuin1212',
        ]
    }

    isKnownCompanySlug (slug) {
        return (this.company_slugs.indexOf(slug) !== -1)
    }

    getCompanySlug () {
        const slug = urlHelper.getCompanySlug()

        if (this.isKnownCompanySlug(slug)) {
            return slug
        }

        return ''
    }
}

export default new CompanyService()
