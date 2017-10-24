/**
 * Gets listing of all blog posts
 */
server.get('/admin/blogs', (req, res) => {
  if (!req.user || !req.user.admin) {
    return res.send(403, {error: "forbidden"})
  }
  Blog.find({}).select('_id title date publishStatus').sort('-date').then((docs) => {
    res.send({blogs: docs})
  })
})


/**
 * Creates or updates a blog post.
 */
server.post('/admin/blog', (req, res) => {
  if (!req.user || !req.user.admin) {
    return res.send(403, {error: "forbidden"})
  }

  if (!req.body.title || !req.body.content) {
    return res.send(403, {error: "no content"})
  }

  if (req.body.id) {
    Blog.findById(req.body.id).then((blog) => {
      blog.title = req.body.title
      blog.content = req.body.content
      blog.publishStatus = req.body.publishStatus
      blog.save().then((doc) => {
        res.send({success: true, blog: doc})
      })
    })
  }
  else {
    var blog = new Blog()
    blog.title = req.body.title
    blog.content = req.body.content
    blog.publishStatus = req.body.publishStatus
    blog.date = Date.now()
    blog._userId = req.user._id
    blog.save().then((doc) => {
      res.send({success: true, blog: doc})
    })    
  }
})