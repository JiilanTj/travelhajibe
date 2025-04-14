const config = require('../config/config');

const getFullUrl = (req, path) => {
    if (!path) return null;
    
    // If path starts with /public/, remove it
    const cleanPath = path.replace(/^\/public\//, '/');
    
    // Construct the base URL
    const protocol = req.protocol;
    const host = req.get('host');
    
    // Return full URL with proper path separation
    return `${protocol}://${host}${cleanPath}`;
};

exports.transformPackageUrls = (package, req) => {
    const transformed = package.toJSON();
    
    // Transform main image URL
    if (transformed.image) {
        transformed.image = {
            path: transformed.image,
            url: getFullUrl(req, transformed.image)
        };
    }

    // Transform additional images URLs
    if (transformed.additionalImages && transformed.additionalImages.length > 0) {
        transformed.additionalImages = transformed.additionalImages.map(imagePath => ({
            path: imagePath,
            url: getFullUrl(req, imagePath)
        }));
    }

    return transformed;
};

module.exports = {
    getFullUrl
}; 