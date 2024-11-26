const paginate = async (model, query, page, limit) => {
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 10; // Default to limit of 10

    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const documents = await model.find(query)
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .exec();

    const totalDocuments = await model.countDocuments(query); // Count total documents matching the query

    return {
        documents,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        limit,
    };
};

module.exports = paginate;

