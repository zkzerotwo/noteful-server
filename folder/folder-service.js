const FolderService = {
    getAllFolder(db) {
        return db
            .select('*')
            .from('noteful_folders')
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('noteful_folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('noteful_folders').select('*').where('id', id).first()
    },
    getNotesByFolder(knex, id) {
        console.log(id)
       return knex.from('noteful_notes').select('*').where('folder', id)
    },
    deleteFolder(knex, id) {
        return knex('noteful_folders')
            .where({ id })
            .delete()
    },
    updateFolder(knex, id, newFolderFields) {
        return knex('noteful_folders')
            .where({ id })
            .update(newFolderFields)
    },
}

module.exports = FolderService