const Joi = require("joi");
module.exports.listingSchema = Joi.object({
    Listing : Joi.object({
        title : Joi.string().required(),
        decription : Joi.string().required,
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required(),
        image : Joi.string().allow("",null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        ratings: Joi.number().required(),
        comment: Joi.string().required().min(1).max(5)
    }).required()
})