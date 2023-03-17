const Cart = require('../model/cart')
const User = require('../model/user')
const Seller = require('../model/seller')
require('dotenv').config()



// Fetches all the items in the Cart Database and returns them
module.exports.Cart_get = async (req, res) => {
    let user = await User.findOne({ email: req.params.email }).lean()
    if (!user) {
        user = await Seller.findOne({ email: req.params.email }).lean()
    }
    const user_id = user._id
    const cartItem = await Cart.findOne({ user_id })
    res.json(cartItem)
}



// Creates a new item in the Cart.
module.exports.addToCart_post = async (req, res) => {
    const results = req.body.prod;
    let user = await User.findOne({ email: req.body.email }).lean()
    if (!user) {
        user = await Seller.findOne({ email: req.body.email }).lean()
    }
    const user_id = user._id
    const cartItem = await Cart.findOne({ user_id })
    try {
        if (cartItem) {
            const found = cartItem.items.some(x => x.prod_id.toString() === results._id)
            if (!found) {
                const item = {
                    prod_id: results._id,
                    name: results.name,
                    quantity: 1,
                    price: results.price,
                    mrp: results.mrp,
                    img: results.img1
                }
                await Cart.findByIdAndUpdate(cartItem._id, { items: [...cartItem.items, item] })
                console.log("Item added to Cart!")
            } else {
                console.log("Item already in Cart!")
            }
        }
        else {
            const tmp = await Cart.create({
                user_id: user_id,
                items: [
                    {
                        prod_id: results._id,
                        name: results.name,
                        quantity: 1,
                        price: results.price,
                        mrp: results.mrp,
                        img: results.img1
                    }
                ]
            }).catch(err => console.log(err))
        }
    } catch (error) {
        console.log(error)
    }
    res.json({ message: "" })
}



// Deletes an item in the Cart using the item id
module.exports.deleteItem_post = async (req, res) => {
    const { item_id, email } = req.body
    try {

        let user = await User.findOne({ email }).lean()
        if (!user) {
            user = await Seller.findOne({ email }).lean()
        }
        const user_id = user._id
        let cartItem = await Cart.findOne({ user_id })
        cartItem.items = cartItem.items.filter(x => x._id.toString() !== item_id)
        const result = await Cart.findByIdAndUpdate(cartItem._id, { items: cartItem.items }, { new: true })
        console.log("Item removed from Cart!")
        res.json(result)
    } catch (error) {
        console.log(error)
    }
}