export class CollectionDTO {
    constructor(raw, itemMapper) {
        this.total = raw.totalItems || 0
        this.items = (raw.member || []).map((item) => itemMapper(item))
        const view = raw.view || {}
        this.firstPage = view.first || null
        this.lastPage = view.last || null
        this.nextPage = view.next || null
        this.previousPage = view.previous || null
    }

    get hasNextPage() {
        return Boolean(this.nextPage)
    }

    get hasPreviousPage() {
        return Boolean(this.previousPage)
    }
}