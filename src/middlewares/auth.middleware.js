import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import dotenv from 'dotenv'

export default async (req,res,next) => {
	try{
		const { userId } = req.session;
		if (!userId) throw new Error('로그인이 필요합니다.')
		const user = await prisma.users.findUnique({where:{userId}})
		if(!user) throw new Error("실패3")
		req.user = user
		next()
	}catch(e){
		console.log(e)
		res.status(401).json({message:e.message})
	}
}