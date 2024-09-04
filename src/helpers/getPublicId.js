

const getUrlPublicId = (url) => {
    
    const separations = url.split('/')
    const name_url = separations[separations.length-1].split('.')
    const public_id = name_url.at(0);

    return public_id

}

module.exports = {
    getUrlPublicId
}