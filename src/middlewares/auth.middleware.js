import express from 'express'
import { prisma } from '../utils/prisma/index.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

export default async (req,res,next) => {
	try{
		const {authorization} = req.cookies
		if(!authorization) throw new Error("실패")
		const [autoType,token] = authorization.split(' ')
		if(autoType!=='Bearer') throw new Error("실패2")
		const userId = jwt.verify(token,process.env.TOKEN_KEY).userId
		const user = await prisma.users.findUnique({where:{userId}})
		if(!user) throw new Error("실패3")
		req.user = user
		next()
	}catch(e){
		res.clearCookie('authorization')
		console.log(e)
		res.status(401).json({message:e.message})
	}
}