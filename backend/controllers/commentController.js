const Comment = require("../Models/Comment");
const News = require("../Models/news");


const addComment = async (req, res) => {
    const { articleId, content } = req.body;
    const userId = req.userId; 
    try {

      const article = await News.findById(articleId);
      if (!article) {
        return res.status(404).json({ message: "المقال غير موجود" });
      }

      
      if (!article.comments) {
        article.comments = [];  
      }

      
      const newComment = new Comment({
        content,
        createdBy: userId,
        article: articleId,
      });

      await newComment.save();

      article.comments.push(newComment._id); 
      await article.save();
      console.log(req.body);
      res.status(201).json({ comment: newComment });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'حدث خطأ أثناء إضافة التعليق' });
    }
};

const deleteComment = async (req, res) => {
    const { commentId } = req.params;

    
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: "التعليق غير موجود" });
    }

  
    if (comment.createdBy.toString() !== req.userId) {
        return res.status(403).json({ message: "لا يمكنك حذف تعليق شخص آخر" });
    }

    comment.isDeleted = true;

    try {
        await comment.save();
        return res.status(200).json({ message: "تم حذف التعليق بنجاح" });
    } catch (error) {
        return res.status(500).json({ message: "حدث خطأ أثناء حذف التعليق", error });
    }
};

const getComments = async (req, res) => {
    const { articleId } = req.params;

    const article = await News.findById(articleId);
    if (!article) {
        return res.status(404).json({ message: "المقال غير موجود" });
    }

    try {
        const comments = await Comment.find({ article: articleId, isDeleted: false })
            .populate("createdBy", "username") 
            .exec();

        return res.status(200).json({ comments });
    } catch (error) {
        return res.status(500).json({ message: "حدث خطأ أثناء جلب التعليقات", error });
    }
};

const reportComment = async (req, res) => {
    const { commentId } = req.params;

 
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json({ message: "التعليق غير موجود" });
    }


    if (!req.userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول للإبلاغ عن تعليق" });
    }


    if (comment.reports.includes(req.userId)) {
        return res.status(400).json({ message: "لقد قمت بالإبلاغ عن هذا التعليق مسبقًا" });
    }

   
    comment.reports.push(req.userId);

    try {
        await comment.save();
        return res.status(200).json({ message: "تم الإبلاغ عن التعليق بنجاح" });
    } catch (error) {
        return res.status(500).json({ message: "حدث خطأ أثناء الإبلاغ عن التعليق", error });
    }
};


module.exports = { addComment ,deleteComment , getComments , reportComment};
