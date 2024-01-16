const model = require('../models/model');

// Create a new category
async function createCategories(req, res) {
  const newCategory = new model.Categories({
    type: "Investment",
    color: "#FCBE44", // dark
  });

  await newCategory.save()
    .then(savedCategory => {
      return res.json(savedCategory);
    })
    .catch(err => {
      return res.status(400).json({ message: `Error while creating categories: ${err.message}`});
    });
}

//  get: http://localhost:8080/api/categories
async function  getCategories(req, res){
   let data = await model.Categories.find({})

   let filter = await data.map(v => Object.assign({}, { type: v.type, color: v.color}));
   return res.json(filter);
}

//  post: http://localhost:8080/api/transaction
async function createTransaction(req, res) {
   if (!req.body) return res.status(400).json("Post HTTP Data not Provided");
 
   try {
     const { name, type, amount } = req.body;
 
     // Create a new transaction instance
     const newTransaction = new model.Transaction({
       name,
       type,
       amount,
       date: new Date(),
     });
 
     // Save the transaction using async/await
     await newTransaction.save();
 
     // Respond with the saved transaction
     return res.json(newTransaction);
   } catch (err) {
     // Handle errors
     return res.status(400).json({ message: `Error while creating transaction: ${err.message}` });
   }
 }

//  get: http://localhost:8080/api/transaction
async function getTransaction(req, res){
   let data = await model.Transaction.find({});
   return res.json(data);
}

//  delete: http://localhost:8080/api/transaction
async function deleteTransaction(req, res) {
   try {
     if (!req.body) return res.status(400).json({ message: "Request body not found" });
 
     // Use await with deleteOne
     const result = await model.Transaction.deleteOne(req.body);
 
     // Check the result to determine if the record was deleted
     if (result.deletedCount > 0) {
       return res.json({ message: "Record Deleted" });
     } else {
       return res.json({ message: "Record not found" });
     }
   } catch (err) {
     return res.status(500).json({ message: `Error while deleting Transaction Record: ${err.message}` });
   }
 }


 //  get: http://localhost:8080/api/labels
async function getLabels(req, res){

   model.Transaction.aggregate([
       {
           $lookup : {
               from: "categories",
               localField: 'type',
               foreignField: "type",
               as: "categories_info"
           }
       },
       {
           $unwind: "$categories_info"
       }
   ]).then(result => {
       let data = result.map(v => Object.assign({}, { _id: v._id, name: v.name, type: v.type, amount: v.amount, color: v.categories_info['color']}));
       res.json(data);
   }).catch(error => {
       res.status(400).json("Looup Collection Error");
   })

}



module.exports = {
  createCategories,
  getCategories,
  createTransaction,
  getTransaction,
  deleteTransaction,
  getLabels
};



