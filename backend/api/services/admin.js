
module.exports = (fastify, opts, next) => {
  // get all blog posts
  fastify.get('/blogs', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || (!req.user.isAdmin.blog && !req.user.isAdmin.super)) {
      return res.code(403).send({error: "forbidden"})
    }
    if (req.user.isAdmin.super) {
      const blogs = await Blog.find({}).populate('_userId', 'account.username').select('_id title date publishStatus _userId').sort('-date').exec()
      res.send({blogs: blogs})
    }
    else if (req.user.isAdmin.blog) {
      const blog = await Blog.find({_userId: req.user._id}).select('_id title date publishStatus').sort('-date').exec()
      res.send({blogs: blog})
    }
  })


  // creates or updates a blog post
  fastify.post('/blog', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || (!req.user.isAdmin.blog && !req.user.isAdmin.super)) {
      return res.code(403).send({error: "forbidden"})
    }

    if (!req.body.title || !req.body.content) {
      return res.code(403).send({error: "no content"})
    }

    if (req.body.id) {
      var blog = await Blog.findById(req.body.id).exec()
      blog.title = req.body.title
      blog.content = req.body.content
      blog.publishStatus = req.body.publishStatus
      await blog.save()
      res.send({success: true, blog: blog})
    }
    else {
      var blog = new Blog()
      blog.title = req.body.title
      blog.content = req.body.content
      blog.publishStatus = req.body.publishStatus
      blog.date = Date.now()
      blog._userId = req.user._id
      await blog.save()
      res.send({success: true, blog: blog})
    }
  })

  next()
}