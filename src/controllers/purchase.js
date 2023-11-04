"use strict"
/* ------------------------------------------------------- */
// Purchase Controller:

const Product = require('../models/product')
const Purchase = require('../models/purchase')

module.exports = {

    list: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "List Purchases"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */

        const data = await res.getModelList(Purchase, {}, ['firm_id', 'brand_id', 'product_id'])

        // res.status(200).send({
        //     error: false,
        //     details: await res.getModelListDetails(Purchase),
        //     data
        // })
        
        // FOR REACT PROJECT:
        res.status(200).send(data)
    },

    create: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Create Purchase"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/Purchase' }
            }
        */

        // Auto add user_id to req.body:
        req.body.user_id = req.user?._id                                //---> user_id'yi ayrıca göndermek istemiyorum. body'e user_id'yi  req.user?._id'den koy

        // Create:
        const data = await Purchase.create(req.body)

        // set stock (quantity) when Purchase process:  
        //1) Purchase yaparken işlem body içerisinde bir product id gidiyor. onu seçiyorum. yularıda zaten dayaı oluşturdum create yaptım
        //2) inc: aslında toplama işlemi. + koymasam da olabilir.  - de koyabilirim mümkün. product içindeki stock'u adet kadar arttır diyorum
        const updateProduct = await Product.updateOne({ _id: data.product_id }, { $inc: { stock: +data.quantity } })

        res.status(201).send({
            error: false,
            data
        })
    },

    read: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Get Single Purchase"
        */

        // Read:
        const data = await Purchase.findOne({ _id: req.params.id }).populate(['firm_id', 'brand_id', 'product_id'])

        res.status(200).send({
            error: false,
            data
        })
    },

    update: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Update Purchase"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/Purchase' }
            }
        */

        if (req.body?.quantity) {                                               //---> adet güncellemesi yapıyorsam
            // güncellemeden önceki güncel stok burası
            const currentPurchase = await Purchase.findOne({ _id: req.params.id })
            // güncellenecek veriyle eski adet arasındaki fark:
            const quantity = req.body.quantity - currentPurchase.quantity
            // çıkan sonuçlara göre de güncelleme yaptığım alan:
            const updateProduct = await Product.updateOne({ _id: currentPurchase.product_id }, { $inc: { stock: +quantity } })
        }

        // Update:
        const data = await Purchase.updateOne({ _id: req.params.id }, req.body, { runValidators: true })

        res.status(202).send({
            error: false,
            data,
            new: await Purchase.findOne({ _id: req.params.id })
        })
    },

    delete: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Delete Purchase"
        */

        // get current stock quantity from the Purchase:
        const currentPurchase = await Purchase.findOne({ _id: req.params.id })
      

        // Delete:
        const data = await Purchase.deleteOne({ _id: req.params.id })

        // set stock (quantity) when Purchase:
        const updateProduct = await Product.updateOne({ _id: currentPurchase.product_id }, { $inc: { stock: -currentPurchase.quantity } })

        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            data
        })
    },
}