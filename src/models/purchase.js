"use strict"
/* -------------------------------------------------------*/
const { mongoose } = require('../configs/dbConnection')
/* ------------------------------------------------------- *
{
    "firm_id": "65343222b67e9681f937f304",
    "brand_id": "65343222b67e9681f937f123",
    "product_id": "65343222b67e9681f937f422",
    "quantity": 1000,
    "price": 20
}
/* ------------------------------------------------------- */
// Purchase Model:

const PurchaseSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    firm_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Firm',
        required: true
    },

    brand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },

    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    quantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        default: 0
    },

    price_total: {
        type: Number,
        default: function () { return this.price * this.quantity }, // for CREATE           react projesi için fieldname'leri db'de değiştirmeden yazabildim ancak,
        transform: function () { return this.price * this.quantity }, // for UPDATE       buradaki bilgiler sabit olmamalı. property'lere func yazabilme imkanım var.
        // set: function () { return this.price * this.quantity } // for sendingData      *Model içindeki Price ve MODEL içindeki QUANTITY 'yi çarp
    }//             Arrow func this kullanımına izin vermediği için normal func yazıyorum. set eklenediğinde FE'in müdahale şansı kalmıyor

}, { collection: 'purchases', timestamps: true })

/* ------------------------------------------------------- */
// FOR REACT PROJECT:
PurchaseSchema.pre('init', function (data) {
    data.id = data._id
    data.createds = data.createdAt.toLocaleDateString('tr-tr')
})
/* ------------------------------------------------------- */
module.exports = mongoose.model('Purchase', PurchaseSchema)