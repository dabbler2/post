import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/posts', authMiddleware, async(req,res) => {
	const {title,content} = req.body
	if(!title||!content) return res.status(400).json({message:"빠짐"})
	await prisma.posts.create({data:{UserId:req.user.userId,title,content}})
	res.status(201).json({message:"글 작성"})
})

router.get('/posts', async(req,res) => {
	const posts = await prisma.posts.findMany({select:{postId:true,UserId:true}})
	res.status(200).json({posts})
})

router.get('/posts/:postId', async(req,res) => {
	const postId = +req.params.postId
	const post = await prisma.posts.findUnique({where:{postId}})
	if(!post) return res.status(400).json({message:"글 없음"})
	res.status(200).json({post})
})

export default router