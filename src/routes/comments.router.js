import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/posts/:postId/comments', authMiddleware, async(req,res,next) => {
	const PostId = +req.params.postId
	const {content} = req.body
	try{
		await prisma.comments.create({data:{UserId:req.user.userId,PostId,content}})
		res.status(201).json({message:"댓글 작성"})
	}catch(e){
		console.log(e)
		next(e)
	}
})

router.get('/posts/:postId/comments', async(req,res) => {
	const comments = await prisma.comments.findMany({where:{PostId:+req.params.postId}})
	res.status(200).json({comments})
})

export default router