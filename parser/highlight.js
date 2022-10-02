/* Syntax highlighting functions
 * accept the identifier name and return the appropriate highlighting
 * case to be translated when constructing the view. */

export function _function(name) {
    return `<function>${name}<end>`;
}

export function _keyword(name) {
    return `<keyword>${name}<end>`;
}

export function _data(name) {
    return `<data>${name}<end>`;
}

export function _operator(name) {
    return `<operator>${name}<end>`;
}

export function _comment(line) {
    return `<comment>${line}<end>`;
}
