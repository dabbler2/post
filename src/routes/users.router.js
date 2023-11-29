import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/sign-up', async(req,res) => {
	try{
		const {email,password,name,age,gender,profileImage} = req.body
		if(!email) return res.status(400).json({message:"이메일 없음"})
		if(!password) return res.status(400).json({message:"비번 없음"})
		if(!name) return res.status(400).json({message:"이름 없음"})
		if(!gender) return res.status(400).json({message:"성별 없음"})
		const existEmail = await prisma.users.findUnique({where:{email}})
		if(existEmail) return res.status(400).json({message:"이메일 중복"})
		const hashPW = await bcrypt.hash(password,8)
		const user = await prisma.users.create({data:{email,password:hashPW}})
		await prisma.userInfos.create({data:{UserId:user.userId,name,age,gender,profileImage}})
		res.status(201).json({mesasge:"가입 완료"})
	}catch(e){next(e)}
	
})

router.post('/sign-in', async(req,res) => {
	const {email,password} = req.body
	const user = await prisma.users.findUnique({where:{email}})
	if(!user) return res.status(400).json({message:"없음"})
	if(!await bcrypt.compare(password,user.password)) return res.status(400).json({message:"아님"})
	res.cookie('authorization', 'Bearer '+jwt.sign({userId:user.userId},'Hold X to pay respects'))
	res.status(200).json({mesasge:"로그인 완료"})
})

router.get('/users', authMiddleware, async(req,res) => {
	const {userId} = req.user
	const user = await prisma.users.findUnique({where:{userId},include:{UserInfos:true}})
	res.status(200).json({message:user})
})

export default router