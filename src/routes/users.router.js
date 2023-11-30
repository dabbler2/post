import express from 'express'
import { Prisma } from '@prisma/client'
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
		await prisma.$transaction(async tx => {
			const user = await prisma.users.create({data:{email,password:hashPW}})
			await prisma.userInfos.create({data:{UserId:user.userId,name,age,gender,profileImage}})
		}, {isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted})
		res.status(201).json({mesasge:"가입 완료"})
	}catch(e){
		console.log(e)
	}
	
})

router.post('/sign-in', async(req,res) => {
	const {email,password} = req.body
	const user = await prisma.users.findUnique({where:{email}})
	if(!user) return res.status(400).json({message:"없음"})
	if(!await bcrypt.compare(password,user.password)) return res.status(400).json({message:"아님"})
	req.session.userId = user.userId
	res.status(200).json({mesasge:"로그인 완료"})
})

router.get('/users', authMiddleware, async(req,res) => {
	const {userId} = req.user
	const user = await prisma.users.findUnique({where:{userId},include:{UserInfos:true}})
	res.status(200).json({message:user})
})

router.patch('/users/', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const updatedData = req.body;

    const userInfo = await prisma.userInfos.findFirst({
      where: { UserId: +userId },
    });

    await prisma.$transaction(
      async (tx) => {
        // 트랜잭션 내부에서 사용자 정보를 수정합니다.
        await tx.userInfos.update({
          data: {
            ...updatedData,
          },
          where: {
            UserId: userInfo.UserId,
          },
        });

        // 변경된 필드만 UseHistories 테이블에 저장합니다.
        for (let key in updatedData) {
          if (userInfo[key] !== updatedData[key]) {
            await tx.userHistories.create({
              data: {
                UserId: userInfo.UserId,
                changedField: key,
                oldValue: String(userInfo[key]),
                newValue: String(updatedData[key]),
              },
            });
          }
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return res
      .status(200)
      .json({ message: '사용자 정보 변경에 성공하였습니다.' });
  } catch (err) {
    next(err);
  }
});

export default router