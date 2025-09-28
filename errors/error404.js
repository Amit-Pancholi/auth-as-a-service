const Response = require('../utils/response-handler')
/**
 * @description it will for handling unwanted page access
 * @param {*} req  
 * @param {*} res
 * @returns {json}  attach json body with res with error message
 */
module.exports = (req,res) =>{
    try {
        return res.status(404).json(new Response(404,null,'Page not found'))
    } catch (err) {
        return res.status(500).json({Message:"Something went wrong",err})
    }
}