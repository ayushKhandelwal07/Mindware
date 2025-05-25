import { NextFunction, Request , Response} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}


export const middleware = (req : Request, res : Response , next : NextFunction) => {
        try{
                const header = req.headers["authorization"];

        if(!header){
                res.status(401).json({
                        msg : "Authorization Header is Missing"
                })
                return;
        }

        const decode = jwt.verify(header as string , JWT_SECRET);
        if(decode){
                if(typeof decode === "string"){
                        res.status(403).json({
                        message: "You are not logged in"
                })
                        return;
                }
        }

        req.userId = (decode as JwtPayload).id;
        next();
        
        }catch(err){
                res.status(500).json({msg : err});
                return
        }
}