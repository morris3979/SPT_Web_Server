import { spawn } from "child_process";
import { Request, Router } from "express";
import { request } from "http";
import { getRepository, MoreThan } from "typeorm";
import { Test } from "../../entity/Test"

const testRouter = Router({});

testRouter.post("/", async(req: Request, res) => {
    let test = await getRepository(Test).findOne({
        schoolID: req.body.test.schoolID,
    });

    if (!test) {
        test = new Test();
        test.schoolID = req.body.test.schoolID;
    }

    test.name = req.body.test.name;
    if (req.body.test.dateOfBirth) {
        test.dateOfBirth = req.body.test.dateOfBirth;
    }
    if (req.body.test.password) {
        test.password = req.body.test.password;
    }
    if (req.body.test.gender) {
        test.gender = req.body.test.gender;
    }
})

export default testRouter;