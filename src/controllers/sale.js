"use strict"
/* ------------------------------------------------------*/
// Sale Controller:

const Product = require('../models/product')                                        //---> çekmeyi unutma zira yapacağın işlem product ile içli dışlı
const Sale = require('../models/sale')

module.exports = {

    list: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "List Sales"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */

        const data = await res.getModelList(Sale, {}, ['brand_id', 'product_id'])

        // res.status(200).send({
        //     error: false,
        //     details: await res.getModelListDetails(Sale),
        //     data
        // })

        // FOR REACT PROJECT:
        res.status(200).send(data)
    },

    create: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Create Sale"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/Sale' }
            }
        */

        // Auto add user_id to req.body:
        req.body.user_id = req.user?._id                                //---> user_id'yi ayrıca göndermek istemiyorum. body'e user_id'yi  req.user?._id'den koy

        // güncel stok görüntüle:
        const currentProduct = await Product.findOne({ _id: req.body.product_id })

        if (currentProduct.stock >= req.body.quantity) {                //---> Güncel stok satış yapılmak istenen adette veya fazlaysa içeri gir

            // Create:
            const data = await Sale.create(req.body)                    //---> Stok yeterli geldi satışa başladım

            // satışla beraber stok güncelliyorum:
            const updateProduct = await Product.updateOne({ _id: data.product_id }, { $inc: { stock: -data.quantity } })   //---> yaptım çünkü satış yaptım

            res.status(201).send({
                error: false,
                data,
            })

        } else {

            res.errorStatusCode = 422
            throw new Error('The current stock does not enough for requested quantity for sale.', { cause: { currentProduct } })
        }
    },

    read: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Get Single Sale"
        */

        // Read:
        const data = await Sale.findOne({ _id: req.params.id }).populate(['brand_id', 'product_id'])

        res.status(200).send({
            error: false,
            data
        })
    },

    update: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Update Sale"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/Sale' }
            }
        */

        if (req.body?.quantity) {
            // varsa adetle beraber güncel stoğa ulaşıyorum:
            const currentSale = await Sale.findOne({ _id: req.params.id })
            // farka ulaşıyorum:
            const quantity = req.body.quantity - currentSale.quantity
            //Filtreleme alanımda ikinci parametre-koşul olarak 2.yi de ekliyorum, stok büyük veya eşittir "gte" diyorum ,, öyleyse bu işlemi yap👇
            const updateProduct = await Product.updateOne({ _id: currentSale.product_id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })
            //.... id'yi stock >= quantity ye getir dediğim için otomatik olarak stok doğrulaması da yapmış oldum
            // console.log(updateProduct)
            
            // stok yeterli değilse:
            if (updateProduct.modifiedCount == 0) { // Check Limit
                res.errorStatusCode = 422
                throw new Error('There is not enough stock for this sale.')
            }
        }

        // Update:
        const data = await Sale.updateOne({ _id: req.params.id }, req.body, { runValidators: true })

        res.status(202).send({
            error: false,
            data,
            new: await Sale.findOne({ _id: req.params.id })
        })
    },

    delete: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Delete Sale"
        */

        // get current stock quantity from the Sale:
        const currentSale = await Sale.findOne({ _id: req.params.id })
        // console.log(currentSale)

        // satış iptal/silme:
        const data = await Sale.deleteOne({ _id: req.params.id })

        // set stock (quantity) when Sale process:                                    //aşağıyı artı yapmamın sebebi satış silindiğinde/İPTAL olduğunda stok artar
        const updateProduct = await Product.updateOne({ _id: currentSale.product_id }, { $inc: { stock: +currentSale.quantity } })

        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            data
        })
    },
}